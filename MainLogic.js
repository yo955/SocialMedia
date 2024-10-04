// Main URL
const bathUrl = "https://tarmeezacademy.com/api/v1";

// UPdate The Ui For Page
UpdateUi();



// Functions get Params
function profileClicked () {
  const user = CurrentUser();
  const userId = user.id;
  window.location =  `/profile.html?userId=${userId}`
}
function postClicked(postId){
  window.location = `./html/PostDetails.html?postId=${postId}`
}

function UserClicked (userId){
window.location = `/profile.html?userId=${userId}`
}

// Loader 
function ShowLoader(show){
  if(show){
    document.getElementById("loaderId").style.visibility = "visible";
  }
  else{
    document.getElementById("loaderId").style.visibility = "hidden";
  }
}


// Pagination
let page = 1;
const limit = 5;
let isLoading = false; 
window.addEventListener("scroll", () => {
  if (!isLoading && window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
    isLoading = true;
    page++;
    getPosts(page); 
  }
});

function getPosts(page = 1) {
  ShowLoader(true);
  axios
    .get(`${bathUrl}/posts?limit=${limit}&page=${page}`)
    .then(function (response) {
      let posts = response.data.data; 
      let content = "";

      ShowLoader(false);

      for (let post of posts) {
        const author = post.author;
        const authorImageSrc = typeof author.profile_image === "string" && author.profile_image
            ? author.profile_image
            : "/imgs/user.png"; 
        const postImageSrc = typeof post.image === "string" && post.image
            ? post.image
            : "/imgs/Post.png"; 

            // show or hide (Edit) button
            let user = CurrentUser();

            let isMyPost = user != null && user.id == author.id;
            let EditButonContent = '';
            if(isMyPost){
              EditButonContent = `
               <button class="btn btn-primary" onclick="Edit_Btn_Clicked('${encodeURIComponent(JSON.stringify(post))}')">
                  Edit
               </button>
               <button class="btn btn-danger" onclick="Delete_Btn_Clicked('${encodeURIComponent(JSON.stringify(post))}')">
               Delete
               </button>
              `
            }

        content += `
          <div class="card mt-4 shadow-lg p-3 mb-5 bg-body-tertiary rounded  ">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span onclick="UserClicked(${author.id})" style="cursor:pointer">
                <img src="${authorImageSrc}" alt="UserPhoto" class="rounded-circle rounded-5" style="width:80px" />
                <b>${author.username}</b>
              </span>
              <span>
               ${EditButonContent}
              </span>
            
            </div>
            <div class="card-body" onclick="postClicked(${post.id})"  style="cursor: pointer;">
              <div class="card-img">
                <img src="${postImageSrc}" alt="PostPhoto" class="w-100" />
              </div>
              <p>${post.created_at}</p>
              <h5 class="card-title">${post.title}</h5>
              <p class="card-text">${post.body}</p>
              <hr />
              <i class="fa-solid fa-pen"></i>
              <span>(${post.comments_count}) Comments</span>
              <span id="post-tags-${post.id}"></span>
            </div>
          </div>
        `;
      }

        document.getElementById("posts").innerHTML += content; 

   
      axios
        .get(`${bathUrl}/tags`)
        .then((response) => {
          const tags = response.data.data; 

          posts.forEach((post) => {
            let tagID = `post-tags-${post.id}`;
            let tagContent = "";

           
            for (let tag of tags) {
              tagContent += `
                <button class="btn btn-sm rounded-5" style="background-color:gray; color:white">
                  ${tag.name}
                </button>
              `;
            }
            document.getElementById(tagID).innerHTML = tagContent; 
          });
          isLoading = false; 
        })
        .catch(function (error) {
          console.log(error); 
          isLoading = false; 
        });
    })
    .catch(function (error) {
      console.log(error); 
      isLoading = false; 
    });
}

const isLogin = localStorage.length > 0;
if(isLogin){
  getPosts();
}

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

  ShowLoader(true);

  axios
    .post(URL, formData, { headers })
    .then((response) => {
      ShowLoader(false);
      const token = response.data.token; 
      const user = response.data.user; 
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user)); 
      showAlert("User registered successfully", "success"); 
      UpdateUi();
      getPosts(); 
    })
    .catch((error) => {
      const errorMessage = error.response.data.message; 
      showAlert(errorMessage, "danger"); 
    }).finally(()=>{
      CloseModal("register-modal");
    })
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
  ShowLoader(true);
  axios
    .post(Url, params)
    .then((response) => {
      ShowLoader(false);
      localStorage.setItem("token", response.data.token); 
      localStorage.setItem("user", JSON.stringify(response.data.user)); 
       
      showAlert("User logged in successfully", "success"); 
      CloseModal("login-modal"); 

      UpdateUi();
      getPosts();
     
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

  if (token === null) { // === User Is the Guest (NOtLogin)
  
    login_div.style.setProperty("display", "flex", "important");
    logout_div.style.setProperty("display", "none", "important");
    if(add_post_btn != null){
      add_post_btn.style.setProperty("display", "none", "important");
    }
    ShowLoader(false);
  } else {  // === User is login 
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


function Edit_Btn_Clicked (postObject){
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("postId-input").value = post.id;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("title-post-input").value=post.title;
  document.getElementById("textarea-post-input").value=post.body;
  document.getElementById("edit-post-btn").innerHTML = "Update";

  let postModal = new bootstrap.Modal(document.getElementById('add-post-modal'), {});
  postModal.toggle();
}

function Delete_Btn_Clicked (postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  document.getElementById("delete-post-input").value = post.id;
  let postModal = new bootstrap.Modal(document.getElementById('delete-post-modal'), {});
  postModal.toggle();
}

function confirmPOstDelete (){
  const postId = document.getElementById("delete-post-input").value;
  const URL = `${bathUrl}/posts/${postId}`;
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: "Bearer " + token
  }

  ShowLoader(true);

   axios.delete(URL,{headers})
  .then((respone)=>{
   ShowLoader(false);
    showAlert("The post has been deleted successfully", "success"); 
    getPosts();
    setTimeout(() => {
      window.location.reload(); // Reload Page  
    }, 700);
  })
  .catch((error)=>{
    const messageError = error.response
    ? error.response.data.message
    : "delete"; 

    showAlert(messageError, "danger"); 
  }).finally(()=>{
    CloseModal("delete-post-modal");
  })
}

// Show the post modal when the "Edit Post" or "Create Post" buttons are clicked
function AddBtnClicked () {

  document.getElementById("postId-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("title-post-input").value='';
  document.getElementById("textarea-post-input").value='';
  document.getElementById("edit-post-btn").innerHTML = "Create";

  let postModal = new bootstrap.Modal(document.getElementById('add-post-modal'), {});
  postModal.toggle();
}

//  To Create A New Post
function handleAddPost() {
  //  Check the input is included Id to know this is create or update
  const postId = document.getElementById("postId-input").value;
  console.log(postId);
  let isCreate = postId == null || postId == "";
 
  const title_post_input = document.getElementById("title-post-input").value;
  const textArea_post_input = document.getElementById("textarea-post-input").value;
  const image_post_input = document.getElementById("image-post-input").files[0]; 

  let formData = new FormData();
  formData.append("title", title_post_input);
  formData.append("body", textArea_post_input);
  if (image_post_input) {
    formData.append("image", image_post_input); 
  }

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: "Bearer " + token, 
  };

  let url = ''; 

  if(isCreate){

      url = `${bathUrl}/posts`;

  }else{

      formData.append("_method","put")   // backEnd Laravel

      url = `${bathUrl}/posts/${postId}`;
  }
  ShowLoader(true);

  axios
  .post(url, formData, { headers })
  .then((response) => {
   ShowLoader(false);
    console.log(response);
    showAlert("The post has been added successfully", "success"); 
    getPosts();
    
    setTimeout(() => {
      window.location.reload(); // Reload Page  
    }, 700);
  })
  .catch((error) => {
    const messageError = error.response
      ? error.response.data.message
      : ""; 
    showAlert(messageError, "danger"); 
  }).finally(()=>{
    CloseModal("add-post-modal"); 
  })
}
