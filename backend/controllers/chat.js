import {Chat } from " .. / models/ Chat.js"
import mongoose from "mongoose"

function getallchats( req , res){
    try{
        const data = fetch("api/admin /chats ").then( res.json())
        data.map((e)=>{
            if( e . active === false )
            {
                await Chat.findanddelete(e.id);
            }
        })
    }
    catch(e){
        console.error( e.error);
    }
        return data
}

// api // chats / : id
function getmychats( req, res){
    try{
        const chats = await (" api/ mychats /:  id")
        chats.map((e)=>{participants.filter((id)=>{id!=req.id!==id})})
        return chats.json();
    }
    catch(e){
        console.error(e);
    }
}

// active --> close 
function lisitingchat( req , res){
    // req -== listing 
     try{
        const chats = Chats.map((e)=>{lisitng.filter((id)=>{req.id!==id})})
        return chats.json();
    }
    catch(e){
        console.error(e);
    }
}