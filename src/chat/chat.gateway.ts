import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
// 게이트웨이는 컨트롤러 역할로 대체함
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  // 소켓 연결시 실행되는 메서드
  async handleConnection(client: Socket) {
    try {
    } catch (e) {
      console.error(e);
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    return;
  }

  // https 메소드와 비슷함
  // receiveMesaage라는 메세지 구독
  @SubscribeMessage('receiveMesaage')
  async receiveMessage(
    // 바디값
    @MessageBody() data: { message: string },
    // 현재 연결된 클라이언트
    @ConnectedSocket() client: Socket,
  ) {
    console.log('receiveMessage');
    console.log(data);
    console.log(client);
  }

  // 클라이언트에서 보내는 서버에서 리스닝 하는 이벤트
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: Socket,
  ) {
    // 클라이언트에서 'sendMessage' 라는 이벤트를 리스닝하고 있으면
    // 데이터 전송
    client.emit('sendMessage', {
      ...data,
      from: 'server',
      id: client.id,
    });
  }
}
