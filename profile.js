UpdateUi();

 // Get Id from query parameters
 const urlParams = new URLSearchParams(window.location.search);
 const ID = urlParams.get('userId');




function ShowUser(){
    const URL =  `${bathUrl}/users/${ID}`
    axios.get(URL)
    .then((Response)=>{
        const user = Response.data.data;
        const authorImageSrc = typeof user.profile_image === "string" && user.profile_image
        ? user.profile_image
        : "/imgs/user.png"; 

        document.getElementById("email").innerHTML = user.email ;
        document.getElementById("name").innerHTML = user.name ;
        document.getElementById("username").innerHTML = user.username ;
        document.getElementById("posts-count").innerText = user.posts_count;
        document.getElementById("Comments-count").innerText = user.comments_count ;
        document.getElementById("name-posts").innerHTML = user.name;
        document.getElementById("user-img").src = authorImageSrc;
    })
    .catch((error)=>{
        const messageError = error.response
        ? error.response.data.message
        : "user"; 
      showAlert(messageError, "danger"); 
    })
}
ShowUser();

function ShowPosts (){
const limit = 6;
const URL = `${bathUrl}/users/${ID}/posts?${limit}`;
axios
.get(URL)
.then(function (response) {
  let posts = response.data.data; 
  let content = "";

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
          <span >
            <img src="${authorImageSrc}" alt="UserPhoto" class="rounded-circle rounded-5" style="width:40px" />
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

    document.getElementById("user-posts").innerHTML += content; 


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

ShowPosts();