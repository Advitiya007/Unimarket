import cloudinary from '../config/cloudinary.js';

const deleteFromCloudinary = async (publicIds = []) => {
  if (!publicIds.length) return;

  const results = await Promise.allSettled(
    publicIds.map((id) =>
      cloudinary.uploader.destroy(id, {
        invalidate: true,
      })
    )
  );

  const failed = results.filter(
    (result) =>
      result.status === 'rejected' ||
      (result.value?.result !== 'ok' &&
        result.value?.result !== 'not found')
  );

  if (failed.length > 0) {
    throw new Error('Some Cloudinary images could not be deleted');
  }
};

export default deleteFromCloudinary;