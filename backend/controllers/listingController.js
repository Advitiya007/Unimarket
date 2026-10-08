import Listing from '../models/Listing.js';
import Chat from '../models/Chat.js';
import createNotification from '../utils/createNotification.js';

const EXPIRY_DAYS = 7;

// @desc   Create a listing
// @route  POST /api/listings
export const createListing = async (req, res) => {
  try {
    const { title, description, category, price, condition, brand, meetupLocation, meetupNotes } = req.body;

    if (!title || !description || !category || !price || !condition || !meetupLocation) {
      return res.status(400).json({ message: 'Missing required listing fields' });
    }

    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

    const listing = await Listing.create({
      seller: req.user._id,
      title,
      description,
      category,
      price,
      condition,
      brand: brand || '',
      images,
      meetupLocation,
      meetupNotes: meetupNotes || '',
      expiresAt,
    });

    res.status(201).json(listing);
  } 
  catch (err) {
    res.status(500).json({ message: 'Failed to create listing', error: err.message });
  }
};

// @desc   Browse/search/filter listings
// @route  GET /api/listings
export const getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      condition,
      hostel,
      meetupLocation,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'Available' };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (meetupLocation) query.meetupLocation = meetupLocation;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'low-high') sortOption = { price: 1 };
    if (sort === 'high-low') sortOption = { price: -1 };

    
    let listingsQuery = Listing.find(query)
      .populate('seller', 'name rating hostel profilePicture')
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    if (hostel) {
      const all = await listingsQuery;
      return res.json(all.filter((l) => l.seller?.hostel === hostel));
    }

    const listings = await listingsQuery;
    const total = await Listing.countDocuments(query);

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
  }
};

// @desc   Get single listing + increment view count
// @route  GET /api/listings/:id
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name rating totalTrades hostel department profilePicture')
      .populate('interestedBuyers.buyer', 'name rating profilePicture');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listing', error: err.message });
  }
};

// @desc   Update a listing (owner only)
// @route  PUT /api/listings/:id
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the listing owner can edit this listing' });
    }

    const editable = ['title', 'description', 'category', 'price', 'condition', 'brand', 'meetupLocation', 'meetupNotes'];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) listing[field] = req.body[field];
    });

    if (req.files && req.files.length > 0) {
      listing.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update listing', error: err.message });
  }
};

// @desc   Delete a listing (owner only)
// @route  DELETE /api/listings/:id
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only the listing owner can delete this listing' });
    }
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing', error: err.message });
  }
};

// @desc   Buyer expresses interest ("I'm Interested")
// @route  POST /api/listings/:id/interest
export const expressInterest = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'Available') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot express interest in your own listing' });
    }

    const alreadyInterested = listing.interestedBuyers.some(
      (b) => b.buyer.toString() === req.user._id.toString()
    );
    if (alreadyInterested) {
      return res.status(400).json({ message: 'You have already expressed interest in this listing' });
    }

    listing.interestedBuyers.push({ buyer: req.user._id, status: 'pending' });
    await listing.save();

    await createNotification(req.io, {
      user: listing.seller,
      message: `${req.user.name} is interested in your listing "${listing.title}"`,
      type: 'interest',
      link: `/listings/${listing._id}`,
    });

    res.json({ message: 'Interest sent to seller', listing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to express interest', error: err.message });
  }
};

// @desc   Seller accepts or rejects a buyer's interest
// @route  POST /api/listings/:id/respond
export const respondToInterest = async (req, res) => {
  try {
    const { buyerId, decision } = req.body;
    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be accepted or rejected' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can respond to interest requests' });
    }

    const entry = listing.interestedBuyers.find((b) => b.buyer.toString() === buyerId);
    if (!entry) return res.status(404).json({ message: 'Interest request not found' });

    entry.status = decision;

    let chat = null;
    if (decision === 'accepted') {
      listing.selectedBuyer = buyerId;
      listing.status = 'Reserved';

      chat = await Chat.create({
        listing: listing._id,
        participants: [listing.seller, buyerId],
        messages: [],
        active: true,
      });

      await createNotification(req.io, {
        user: buyerId,
        message: `Your interest in "${listing.title}" was accepted! You can now chat with the seller.`,
        type: 'accepted',
        link: `/chats/${chat._id}`,
      });
    } else {
      await createNotification(req.io, {
        user: buyerId,
        message: `Your interest in "${listing.title}" was declined.`,
        type: 'rejected',
        link: `/listings/${listing._id}`,
      });
    }

    await listing.save();
    res.json({ listing, chat });
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to interest', error: err.message });
  }
};

// @desc   Listings belonging to the logged in seller (dashboard)
// @route  GET /api/listings/mine/all
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('interestedBuyers.buyer', 'name rating profilePicture')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your listings', error: err.message });
  }
};
