// Main URL
const bathUrl = "https://tarmeezacademy.com/api/v1";

// UPdate The Ui For Page
UpdateUi();

// ********** Register ************
const handleRegisterbtn = () => {
  const RegisterName = document.getElementById("register-name-input").value;
  const RegisterUserName = document.getElementById("register-username-input").value;
  const RegisterPassword = document.getElementById("register-password-input").value;
  const profile_image = document.getElementById('register-image-input').files[0]; // صورة الملف الشخصي
// Use FormData because send the image To Backend
  let formData = new FormData();
  formData.append('name', RegisterName);
  formData.append('username', RegisterUserName);
  formData.append('password', RegisterPassword);
  if (profile_image) {
    formData.append('image', profile_image); 
  }

  const headers = {
    "Content-Type": "multipart/form-data" 
  };

  const URL = `${bathUrl}/register`;
  axios
    .post(URL, formData, { headers })
    .then((response) => {
      const token = response.data.token; 
      const user = response.data.user; 
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user)); 
      showAlert("User registered successfully", "success"); 
      UpdateUi();
      getPost(); 
      CloseModal("register-modal"); 
    })
    .catch((error) => {
      const errorMessage = error.response.data.message; 
      showAlert(errorMessage, "danger"); 
    });
};

// ********** Login ************** 
const handleLoginbtn = () => {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;

  const params = {
    "username": username,
    "password": password,
  };
  const Url = `${bathUrl}/login`;
  axios
    .post(Url, params)
    .then((response) => {
      localStorage.setItem("token", response.data.token); 
      localStorage.setItem("user", JSON.stringify(response.data.user)); 

      UpdateUi(); 
      showAlert("User logged in successfully", "success"); 
      CloseModal("login-modal"); 
     
      if(window.location.href = 'http://127.0.0.1:5500/html/Home.html'){
        getPosts();
      }else{
        getPost();  
      }
      UpdateUi();
     
    })
    .catch((error) => {
      const errorMessage = error.response ? error.response.data.message : 'No Error'; 
      showAlert(errorMessage, 'danger');
    });
};

// ******* LogedOut ****** 
function Logedout() {
  localStorage.removeItem("token"); 
  localStorage.removeItem("user"); 
  showAlert("Logged out successfully", "success"); 
  CloseModal("logout-modal"); 
  const posts =  document.getElementById("posts");
  const post =  document.getElementById("post");
  if(posts){
    posts.innerHTML = '';
  }
  else{
    post.innerHTML = '';
    document.getElementById('main-content').innerHTML = ''
  }
  UpdateUi(); 
}


//  ********* Refresh the Ui for thePage ***********
function UpdateUi() {
  let token = localStorage.getItem("token"); // 
  const login_div = document.getElementById("login-div");
  const logout_div = document.getElementById("logout-div");
  const add_post_btn = document.getElementById("add-post-btn");

  if (token === null) {
  
    login_div.style.setProperty("display", "flex", "important");
    logout_div.style.setProperty("display", "none", "important");
    if(add_post_btn != null){
      add_post_btn.style.setProperty("display", "none", "important");
    }
  } else {
    login_div.style.setProperty("display", "none", "important");
    logout_div.style.setProperty("display", "flex", "important");
    if(add_post_btn != null){
      add_post_btn.style.setProperty("display", "block", "important");
    }

    const user = CurrentUser();
    document.getElementById('nav-user').innerHTML = user.name;
    if (user.profile_image) {
      const userImage = typeof user.profile_image === "string" ? user.profile_image : "/imgs/user.png";
      document.querySelector('#img-user-nav img').src = userImage;
    }
  }
}

//  ********* ShowAlert Message *********
function showAlert(message, type) {
  const alertPlaceholder = document.getElementById("successAlert");


  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  alertPlaceholder.append(wrapper);

  setTimeout(() => {
    wrapper.remove(); // إزالة الرسالة بعد مدة قصيرة
  }, 2000);
}
UpdateUi();

// **********TO CLose The Modal*********
function CloseModal(ID) {
  const modal = document.getElementById(ID);
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();
}

// To Check the user is != Null
function CurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem('user');
  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }
  return user;
}

