document.addEventListener('DOMContentLoaded', function() {
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const joinBtn = document.getElementById('joinBtn');
    const exitBtn = document.getElementById('exitBtn');
    let sessionBtn = document.getElementById('sessionBtn')
    const messageDiv = document.getElementById('text_print_Box');
    
    let reqNo = 1;
   
    let kurentoPeer;
   
    signalSocketIo.on('knowledgetalk', function(data) {
   
      // console.log('receive', data);
      tLogBox('receive', data)
      if (!data.eventOp && !data.signalOp) {
        console.log('error', 'eventOp undefined');
      }
   
      if (data.eventOp === 'Login') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
        if(data.code == '200'){
          tTextbox('로그인 되었습니다');
        }
      }
   
      if (data.eventOp === 'Invite') {
        roomId = data.roomId;
   
        callBtn.disabled = true;
        joinBtn.disabled = false;
      }
   
      if (data.eventOp === 'Call') {
        roomId = data.roomId;
        sessionBtn.disabled = false;
        exitBtn.disabled = false;
      }
   
      if (data.eventOp === 'Join') {
        roomId = data.roomId;
        tTextbox('회의에 참여 하였습니다.');
        joinBtn.disabled = true;
        sessionBtn.disabled = false;
        exitBtn.disabled = false;
      }
   
      if (data.eventOp === 'SDP') {
        if (data.sdp && data.sdp.type === 'answer' && kurentoPeer) {
        }
      }
    
      if (data.eventOp === 'Candidate') {
        if (!data.candidate) return;
   
        let iceData = {
          eventOp: 'Candidate',
          reqNo: reqNo++,
          resDate: nowDate(),
          userId: inputId.value,
          roomId: data.roomId,
          candidate: data.candidate,
          useMediaSvr: 'Y',
          usage: 'cam'
        };
   
        try {
          console.log('send', iceData);
          tLogBox('send', iceData);
          signalSocketIo.emit('knowledgetalk', iceData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
      }
  
      if (data.eventOp === 'SessionReserve') {
        if (data.code === '200') {
          messageDiv.innerText = '공유 자원이 예약되었습니다.';
          tTextbox(messageDiv.innerText);
        } else if (data.code === '440') {
          messageDiv.innerText = '이미 다른 사람이 공유를 예약하였습니다.';
          tTextbox(messageDiv.innerText);
        } else {
          tTextbox('서버에서 에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      }
    });
   
    //로그인 버튼
    loginBtn.addEventListener('click', function(e) {
      let loginData = {
        eventOp: 'Login',
        reqNo: reqNo++,
        userId: inputId.value,
        userPw: passwordSHA256(inputPw.value),
        reqDate: nowDate(),
        deviceType: 'pc'
      };
   
      try {
        console.log('send', loginData);
        tLogBox('send', loginData);
        signalSocketIo.emit('knowledgetalk', loginData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
   
    });
   
    //회의 초대 버튼 
    callBtn.addEventListener('click', function(e) {
      let callData = {
        eventOp: 'Call',
        reqNo: reqNo++,
        userId: inputId.value,
        reqDate: nowDate(),
        reqDeviceType: 'pc',
        serviceType: 'multi',
        targetId: ['orange']
      };
   
      try {
        console.log('send', callData);
        tLogBox('send', callData);
        let tempText = callData.targetId + "를 초대 하였습니다."
        tTextbox(tempText)
        
        signalSocketIo.emit('knowledgetalk', callData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    joinBtn.addEventListener('click', function(e) {
      let joinData = {
        eventOp: 'Join',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        roomId,
        status: 'accept'
      };
   
      try {
        console.log('send', joinData);
        tLogBox('send', joinData);
        signalSocketIo.emit('knowledgetalk', joinData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    exitBtn.addEventListener('click', function(e) {
      loginBtn.disabled = false;
      callBtn.disabled = true;
      joinBtn.disabled = true;
      exitBtn.disabled = true;
      dispose();
    });
   
   
   
    sessionBtn.addEventListener('click', function(e){
        let sessionData = {
            eventOp : 'SessionReserve',
            reqNo : reqNo++,
            userId : inputId.value,
            reqDate : nowDate(),
            roomId
        }
  
        try {
          console.log('send', sessionData);
          tLogBox('send', sessionData);
          signalSocketIo.emit('knowledgetalk', sessionData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
    })
  });