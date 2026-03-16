Your code is already good 👍.
To switch to the **Socket.io room approach**, you only need to change **`chat.gateway.ts`**.
Your **entity, service, and module files remain the same**.

I’ll show **exactly what to remove and what to add**.

---

# 1️⃣ Remove the Map (IMPORTANT)

### ❌ DELETE this line

```ts
private connectedUsers: Map<string, string> = new Map();
```

---

# 2️⃣ Update `handleConnection()`

### ❌ REMOVE this

```ts
const userId = payload.sub;

this.connectedUsers.set(userId, client.id);
console.log(`User connected: ${userId} (${client.id})`);
```

---

### ✅ REPLACE with

```ts
const userId = payload.sub;

client.data.userId = userId; // store userId in socket
client.join(userId); // user joins a room with his id

console.log(`User connected: ${userId} (${client.id})`);
```

---

# 3️⃣ Simplify `handleDisconnect()`

### ❌ REMOVE the whole loop

```ts
for (const [userId, socketId] of this.connectedUsers.entries()) {
  if (socketId === client.id) {
    this.connectedUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
    break;
  }
}
```

---

### ✅ REPLACE with

```ts
handleDisconnect(client: Socket) {
  const userId = client.data.userId;
  console.log(`User disconnected: ${userId}`);
}
```

No Map needed anymore.

---

# 4️⃣ Update `handleSendMessage()`

### ❌ REMOVE this

```ts
const senderId = this.getUserIdBySocketId(client.id);
if (!senderId) return;

const receiverSocketId = this.connectedUsers.get(data.receiverId);
if (receiverSocketId) {
  this.server.to(receiverSocketId).emit('receiveMessage', message);
}
```

---

### ✅ REPLACE with

```ts
const senderId = client.data.userId;

const message = await this.chatService.createMessage(
  senderId,
  data.receiverId,
  data.content,
);

// send to receiver room
this.server.to(data.receiverId).emit('receiveMessage', message);

// confirm to sender
client.emit('messageSent', message);
```

---

# 5️⃣ Update `handleGetMessages()`

### ❌ REMOVE

```ts
const userId = this.getUserIdBySocketId(client.id);
```

---

### ✅ REPLACE with

```ts
const userId = client.data.userId;
```

---

# 6️⃣ Update `handleGetConversations()`

### ❌ REMOVE

```ts
const userId = this.getUserIdBySocketId(client.id);
```

---

### ✅ REPLACE with

```ts
const userId = client.data.userId;
```

---

# 7️⃣ DELETE This Function Completely

### ❌ REMOVE this entire function

```ts
private getUserIdBySocketId(socketId: string): string | undefined {
  for (const [userId, id] of this.connectedUsers.entries()) {
    if (id === socketId) return userId;
  }
  return undefined;
}
```

It is no longer needed.

---

# 8️⃣ Final Architecture After Changes

Flow becomes:

```
User connects
      ↓
JWT verified
      ↓
client.join(userId)
      ↓
User is now in room "userId"
```

Sending message:

```
server.to(receiverId).emit('receiveMessage')
```

Socket.io automatically sends to **all tabs/devices**.

---

# 9️⃣ Final Clean `chat.gateway.ts` Structure

After changes your gateway becomes roughly:

```ts
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.authService.verifyToken(
        token.replace('Bearer ', ''),
      );

      const userId = payload.sub;

      client.data.userId = userId;
      client.join(userId);

      console.log(`User connected: ${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.data.userId}`);
  }
}
```

---

# 🔥 Result

Your chat system now supports:

✅ Multiple tabs
✅ Multiple devices
✅ Cleaner architecture
✅ No manual socket tracking
✅ Scalable

---

If you want, I can also show you **2 more upgrades** that will make your chat **production-level like WhatsApp**:

1️⃣ **typing indicator**
2️⃣ **online/offline status**
3️⃣ **message read receipts**
4️⃣ **Redis scaling for multiple servers**

These are **very common NestJS interview questions** too.
