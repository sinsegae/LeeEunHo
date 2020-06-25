document.addEventListener('DOMContentLoaded', function () {

    let loginBtn = document.getElementById('loginBtn');
    let logoutBtn = document.getElementById('logoutBtn');
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    let reqNo = 1

    signalSocketIo.on('knowledgetalk', function (data) {
        tLogBox('receive', data);

        if (!data.eventOp && !data.signalOp) {
            tLogBox('error', 'eventOp undefined');
        }
    });

    loginBtn.addEventListener('click', function (e) {
        let loginData = {
            eventOp: 'Login',
            reqNo: reqNo++,
            reqDate: nowDate(),
            userId: inputId.value,
            userPw: passwordSHA256(inputPw.value),
            deviceType: 'pc'
        };

        try {
            tLogBox('send', loginData);
            tTextbox('로그인 되었습니다');
            signalSocketIo.emit('knowledgetalk', loginData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });

    logoutBtn.addEventListener('click', function (e) {
        let logoutData = {
            eventOp: 'Logout',
            reqNo: reqNo++,
            userId: inputId.value,
            reqDate: nowDate()
        };
        try {
            tLogBox('send', logoutData);
            tTextbox('로그아웃 하였습니다');
            signalSocketIo.emit('knowledgetalk', logoutData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });
});