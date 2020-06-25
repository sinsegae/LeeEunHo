document.addEventListener('DOMContentLoaded', function () {
    let inputId = document.getElementById('inputId')
    let inputPw = document.getElementById('inputPw')
    let inputName = document.getElementById('inputName')
    let loginBtn = document.getElementById('loginBtn')
  
    let reqNo = 1
  
    signalSocketIo.on('knowledgetalk', function (data) {
      tLogBox('receive', data);
  
      if (!data.eventOp && !data.signalOp) {
        tLogBox('error', 'eventOp undefined');
      }
  
      if (data.code == '200') {
        tTextbox('회원가입 성공');
      } else if (data.code == '409'){
        tTextbox('중복된 아이디가 있습니다.');
      } else {
        tTextbox('서버에서 에러가 발생하였습니다. 관리자에게 문의해주세요.');
      }
    
    });
  
  
    loginBtn.addEventListener('click', function (e) {
      if (!inputId.value || !inputPw.value || !inputName.value) {
        tTextbox('데이터를 입력하세요.');
        return false;
      }
  
      let signupData = {
        eventOp: 'SignUp',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        userPw: passwordSHA256(inputPw.value),
        userName: inputName.value,
        deviceType: 'pc'
      }
  
      try {
        tLogBox('send', signupData);
        signalSocketIo.emit('knowledgetalk', signupData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
  });