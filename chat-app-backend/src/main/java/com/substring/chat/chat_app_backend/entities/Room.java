package com.substring.chat.chat_app_backend.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Id
    private String id;//Mongo db : unique identifier

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }


    public String getRoomId() {
        return roomId;
    }

    private String roomId;
    private List<Message> messages = new ArrayList<>();
    public List<Message> getMessages() {
        return messages;
    }

}
