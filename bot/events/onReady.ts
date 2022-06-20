import { EventReady } from "../bot";

const event: EventReady = async (client) => {
    if(!client.user){
        return;
    }
        
    console.log(`Logged in as ${client.user.tag}`)
}

export default event