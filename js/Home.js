  let page = 1;
  const limit = 5;
  let isLoading = false; 
  // Pagination
  window.addEventListener("scroll", () => {
    if (!isLoading && window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
      isLoading = true;
      page++;
      getPosts(page); 
    }
  });
  
  
  function postClicked(postId){
        window.location = `./PostDetails.html?postId=${postId}`
      }
  

  function getPosts(page = 1) {
    axios
      .get(`${bathUrl}/posts?limit=${limit}&page=${page}`)
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
                `
              }
  
          content += `
            <div class="card mt-4 shadow-lg p-3 mb-5 bg-body-tertiary rounded  ">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>
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

function handleAddPost() {
    //  Check the input is included Id to know this is create or update
    const posId = document.getElementById("postId-input").value;
    console.log(posId);
    let isCreate = posId == null || posId == "";
   
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

        url = `${bathUrl}/posts/${posId}`;
    }
    axios
    .post(url, formData, { headers })
    .then((response) => {
      console.log(response);
      showAlert("The post has been added successfully", "success"); 
      getPosts();
      
      setTimeout(() => {
        window.location.reload(); // Reload Page  
      }, 1000);
    })
    .catch((error) => {
      const messageError = error.response
        ? error.response.data.message
        : "An error occurred"; 
      showAlert(messageError, "danger"); 
    });

    CloseModal("add-post-modal"); 
  
  }
  // Show the post modal when the "Edit Post" or "Create Post" buttons are clicked
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

  function AddBtnClicked () {

    document.getElementById("postId-input").value = "";
    document.getElementById("post-modal-title").innerHTML = "Create A New Post";
    document.getElementById("title-post-input").value='';
    document.getElementById("textarea-post-input").value='';
    document.getElementById("edit-post-btn").innerHTML = "Create";

    let postModal = new bootstrap.Modal(document.getElementById('add-post-modal'), {});
    postModal.toggle();
  }


  // To Render Posts in Page
  getPosts()