import { EventType } from "../bot";

const event: EventType = async (client) => {
    if(!client.user){
        return;
    }
        
    console.log(`Logged in as ${client.user.tag}`)
}

export default event