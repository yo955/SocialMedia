 // Get Id from query parameters
 const urlParams = new URLSearchParams(window.location.search);
 const Id = urlParams.get('postId');

 function getPost() {
   const URL = `${bathUrl}/posts/${Id}`;
   let content = '';

   axios
     .get(URL)
     .then((response) => {
       const post = response.data.data;
       const comments = post.comments ? post.comments : [];

       // Processing author data
       const author = post.author || {};
       const authorImageSrc =typeof author.profile_image === "string" ?author.profile_image :"../imgs/user.png"; // Default author image

       // Processing post data
       const postImageSrc =typeof post.image === "string" ? post.image : "../imgs/Post.png"; // Default post image
       const comment_img = 
       // Creating post content
       content += `
         <div class="card mt-4 shadow-lg p-3 mb-5 bg-body-tertiary rounded">
           <div class="card-header">
             <span>
               <img src="${authorImageSrc}" alt="UserPhoto" class="max-width-100 rounded-circle rounded-5" />
               <b>${author.username || 'Unknown'}</b>
             </span>
           </div>
           <div class="card-body">
             <div class="card-img">
               <img src="${postImageSrc}" alt="PostPhoto" class="w-100" />
             </div>
             <p>${post.created_at}</p>
             <h5 class="card-title">${post.title || 'No Title'}</h5>
             <p class="card-text">${post.body || 'No Content'}</p>
             <hr />
             <i class="fa-solid fa-pen"></i>
             <span>(${post.comments_count || 0}) Comments</span>
             <div id="comments" class="container mt-3">
               ${comments.length > 0 ? comments.map(comment => `
                 <div class="col-12">
                   <span>
                    <img src="${typeof comment.author.profile_image === "string" ? comment.author.profile_image :'../imgs/user.png'}" alt="UserPhoto" class="rounded-circle rounded-5" style="width:50px;height:50px" />
                     <b>${comment.author.name || 'Unknown'}</b>
                   </span>
                   <p>${comment.body || 'No Comment'}</p>
                 </div>
               `).join('') : ''}
             </div>
             <div class="input-group mb-3" id="comment-container">
               <input id="comment-input" type="text" class="form-control" placeholder="Add Comment" aria-label="Add Comment" />
               <button onclick="AddComment()" class="btn btn-outline-success" type="button" id="button-addon2">Send</button>
             </div>
           </div>
         </div>
       `;

       // Updating the DOM
       document.getElementById('user-name').textContent = author.username || 'Unknown';
       document.getElementById('post').innerHTML = content;
     })
     .catch((error) => {
       console.error('Error fetching post:', error);
     });
 }

 function AddComment() {
   const commentInput = document.getElementById('comment-input');
   const commentText = commentInput.value.trim();
   if (!commentText) {
     messageError='Please enter a comment.';
     showAlert(messageError, "danger");
     return;
   }

   const URL = `${bathUrl}/posts/${Id}/comments`;
   const token = localStorage.getItem('token');

   const headers = {
     Authorization: `Bearer ${token}`,
     'Content-Type': 'application/json'
   };

   axios
     .post(URL, { body: commentText }, { headers })
     .then((response) => {
       console.log('Comment added:', response.data);
       commentInput.value = ''; // Clear the input field
       showAlert("the comment has been created","success")
       getPost(); // Reload the post to show the new comment
       UpdateUi();
     })
     .catch((error) => {
       const messageError = error.response
       ? error.response.data.message
       : "An error occurred"; 
     showAlert(messageError, "danger"); 
     });
 }

 // Initial call to load post data
 getPost();
 UpdateUi();