document.addEventListener('DOMContentLoaded', function () {
    const inputId = document.getElementById('inputid');
    const inputPw = document.getElementById('inputpw');
    const inputTarget = document.getElementById('inputTarget');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const exitBtn = document.getElementById('exitBtn');
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');

    let reqNo = 1;
    let localStream;
    let peerCon;
    let configuration = [];


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
            tLogBox('send(login)', loginData);
            signalSocketIo.emit('knowledgetalk', loginData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again : ' + err.message);
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
            reqDeviceType: 'pc'
        };

        try {
            tLogBox('send(call)', callData);
            signalSocketIo.emit('knowledgetalk', callData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }

    });

    exitBtn.addEventListener('click', function (e) {
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
        let callEndData = {
            eventOp: 'ExitRoom',
            reqNo: reqNo,
            userId: inputId.value,
            reqDate: nowDate(),
            roomId
        };

        try {
            tLogBox('send', callEndData);
            signalSocketIo.emit('knowledgetalk', callEndData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });

    function onIceCandidateHandler(e) {
        if (!e.candidate) return;

        let iceData = {
            eventOp: 'Candidate',
            reqNo: reqNo++,
            userId: inputId.value,
            reqDate: nowDate(),
            candidate: e.candidate,
            roomId,
            usage: 'cam',
            useMediaSvr: 'N'
        };

        try {
            tLogBox('send(onIceCandidateHandler)', iceData);
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
        remoteVideo.srcObject = e.streams[0];
    }

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
            if (data.message !== 'OK') {
                return;
            }

            configuration.push({
                urls: data.serverInfo['_j'].turn_url,
                credential: data.serverInfo['_j'].turn_credential,
                username: data.serverInfo['_j'].turn_username
            });

            callBtn.disabled = true;
            navigator.mediaDevices
                .getUserMedia({
                    video: true
                })
                .then(stream => {
                    localStream = stream;
                    localVideo.srcObject = stream;
                });
        }

        if (data.eventOp == 'SDP') {
            if (data.sdp && data.sdp.type === 'offer') {

                roomId = data.roomId;
                peerCon = new RTCPeerConnection(configuration);

                peerCon.onicecandidate = onIceCandidateHandler;


                peerCon.ontrack = onAddStreamHandler;
                localStream.getTracks().forEach(function (track) {
                    peerCon.addTrack(track, localStream);
                });

                peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
                peerCon.createAnswer().then(sdp => {
                    peerCon.setLocalDescription(new RTCSessionDescription(sdp));

                    let ansData = {
                        eventOp: 'SDP',
                        reqNo: reqNo++,
                        userId: inputId.value,
                        reqDate: nowDate(),
                        sdp,
                        roomId,
                        usage: 'cam',
                        useMediaSvr: 'N'
                    };

                    try {
                        console.log('sdp answer data ', ansData);
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
            if (data.candidate) peerCon.addIceCandidate(new RTCIceCandidate(data.candidate));

            let iceData = {
                eventOp: 'Candidate',
                roomId: data.roomId,
                reqNo: data.reqNo,
                resDate: nowDate(),
                code: '200'
            };

            try {
                tTextbox('전화 연결이 되었습니다.');
                tLogBox('send(candidate)', iceData);
                signalSocketIo.emit('knowledgetalk', iceData);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    alert(' there was a syntaxError it and try again : ' + err.message);
                } else {
                    throw err;
                }
            }
        }

        if (data.signalOp === 'Presence') {
            if (data.action === 'exit') {
                localVideo.srcObject = null;
                remoteVideo.srcObject = null;
            }
        }

    });

})