interface wsMsg {
  type: string
  data: any
}

function sendToWs(ws: WebSocket, eventType: string, data: any) {
  let wsMsg: wsMsg = {
    type: eventType,
    data: {}
  }

  if (data.constructor === Array) {
    data.forEach((item: [string, any]) => {
      wsMsg.data[item[0]] = item[1]
    })
  } else {
    wsMsg.data = data
  }
  console.log(JSON.stringify(wsMsg))
  ws.send(JSON.stringify(wsMsg))
}

export { sendToWs }