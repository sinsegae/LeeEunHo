document.addEventListener('DOMContentLoaded', function () {
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    const inputTarget = document.getElementById('inputTarget');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const docShare = document.getElementById('docShare');
    const localDocList = document.getElementById('localDocList');
    const localDoc = document.getElementById('localDoc');
  
    let reqNo = 1;
    let peerCon;
    let localStream;
    let roomId;
  
  
    loginBtn.addEventListener('click', function (e) {
      let loginData = {
        eventOp: 'Login',
        reqNo: reqNo++,
        userId: inputId.value,
        userPw: passwordSHA256(inputPw.value),
        reqDate: nowDate(),
        deviceType: 'pc'
      };
  
      try {
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
  
    callBtn.addEventListener('click', function (e) {
      let callData = {
        eventOp: 'Call',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        targetId: [inputTarget.value],
        serviceType: 'call',
        reqDeviceType: 'pc'
      };
  
      try {
        tLogBox('send', callData);
        tTextbox('전화 연결중입니다.');
        signalSocketIo.emit('knowledgetalk', callData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
  
    docShare.addEventListener('change', function (e) {
      let i;
      for (i = 0; i < this.files.length; i++) {
        fileObj = this.files[i];
  
        let reader = new FileReader();
  
        reader.addEventListener('load', function (fileObj) {
          let docEl = document.createElement('li');
          let imgEl = document.createElement('img');
  
          imgEl.name = fileObj.name;
          imgEl.src = reader.result;
          imgEl.style.width = '200px';
  
          imgEl.addEventListener('click', function (e) {
            let fileName = e.target.name;
            let localImage = new Image();
  
            localImage.addEventListener('load', function () {
              let localCtx = localDoc.getContext('2d');
  
              localCtx.drawImage(
                localImage,
                0,
                0,
                localDoc.width,
                localDoc.height
              );
            });
  
            localImage.src = reader.result;
  
            let fileData = {
              eventOp: 'FileShare',
              reqNo: reqNo++,
              roomId,
              fileUrl: reader.result,
              reqDate: nowDate(),
              userId: inputId
            };
  
            try {
              tLogBox('send', fileData);
              signalSocketIo.emit('knowledgetalk', fileData);
            } catch (err) {
              if (err instanceof SyntaxError) {
                alert(
                  ' there was a syntaxError it and try again : ' + err.message
                );
              } else {
                throw err;
              }
            }
          });
  
          localDocList.appendChild(docEl);
          docEl.appendChild(imgEl);
  
          let fileData = {
            eventOp: 'FileShareStart',
            reqNo: reqNo++,
            roomId,
            fileInfoList: {
              fileName: fileObj.name,
              url: reader.result
            },
            reqDate: nowDate(),
            userId: inputId
          };
  
          try {
            tLogBox('send', fileData);
            tTextbox('파일 공유가 되었습니다.')
            signalSocketIo.emit('knowledgetalk', fileData);
          } catch (err) {
            if (err instanceof SyntaxError) {
              alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
              throw err;
            }
          }
        });
  
        reader.readAsDataURL(fileObj);
      }
    });
  
    signalSocketIo.on('knowledgetalk', function (data) {
      tLogBox('receive', data);
  
      if (!data.eventOp && !data.signalOp) {
        tLogBox('error', 'eventOp undefined');
      }
  
      if (data.eventOp === 'Login') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
        tTextbox('로그인 되었습니다');
      }
  
      if (data.eventOp === 'Call') {
        callBtn.disabled = true;
        docShare.disabled = false;
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false
          })
          .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;
          });
          tTextbox('전화 연결 되었습니다.');
      }
  
      if (data.eventOp === 'SDP') {
        if (data.sdp.type === 'offer') {
          roomId = data.roomId;
          peerCon = new RTCPeerConnection(configuration);
  
          peerCon.onicecandidate = onIceCandidateHandler;
          peerCon.onaddstream = onAddStreamHandler;
  
          peerCon.addStream(localStream);
  
          peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
          peerCon.createAnswer().then(sdp => {
            peerCon.setLocalDescription(new RTCSessionDescription(sdp));
  
            let ansData = {
              eventOp: 'SDP',
              sdp,
              useMediaSvr: 'N',
              userId: inputId.value,
              roomId,
              reqNo: reqNo++,
              reqDate: nowDate()
            };
  
            try {
              tLogBox('send', ansData);
              signalSocketIo.emit('knowledgetalk', ansData);
            } catch (err) {
              if (err instanceof SyntaxError) {
                alert(
                  ' there was a syntaxError it and try again : ' + err.message
                );
              } else {
                throw err;
              }
            }
          });
        }
      }
  
      if (data.eventOp === 'Candidate') {
        peerCon.addIceCandidate(new RTCIceCandidate(data.candidate));
  
        let iceData = {
          eventOp: 'Candidate',
          roomId: data.roomId,
          reqNo: data.reqNo,
          resDate: nowDate(),
          code: '200'
        };
  
        try {
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
    });
  
    function onIceCandidateHandler(e) {
      if (!e.candidate) return;
  
      let iceData = {
        eventOp: 'Candidate',
        candidate: e.candidate,
        useMediaSvr: 'N',
        userId: inputId.value,
        roomId,
        reqNo: reqNo++,
        reqDate: nowDate()
      };
  
      try {
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
  
    function onAddStreamHandler(e) {
      remoteVideo.srcObject = e.stream;
    }
  
  
  });