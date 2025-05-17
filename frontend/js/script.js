$(document).ready(function () {
  // LOGIN
  $('#loginBtn').on('click', function () {
    const username = $('#username').val();
    const password = $('#password').val();

    $.ajax({
      url: 'http://localhost:8080/api/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ username, password }),
      success: function (res) {
        localStorage.setItem('token', res.token);
        window.location.href = 'index.html';
      },
      error: function () {
        alert('Login gagal');
      }
    });
  });

  // REGISTER
  $('#registerBtn').on('click', function () {
    const username = $('#reg-username').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();

    $.ajax({
      url: 'http://localhost:8080/api/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ username, email, password }),
      success: function () {
        alert('Registrasi berhasil. Silakan login.');
        window.location.href = 'login.html';
      },
      error: function () {
        alert('Registrasi gagal');
      }
    });
  });

  // LOGOUT
  $('#logoutBtn').on('click', function () {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Proteksi halaman index.html
  if (window.location.pathname.includes('index.html') && !localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
});

const apiUrl = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

// Helper: auth header
function getAuthHeaders() {
  return { Authorization: 'Bearer ' + token };
}

// LOAD POSTINGAN
if (window.location.pathname.includes('index.html')) {
  function loadPosts(keyword = '') {
    $.ajax({
      url: apiUrl + '/posts?search=' + encodeURIComponent(keyword),
      headers: getAuthHeaders(),
      success: function (posts) {
        $('#postList').empty();
        posts.forEach(post => {
          $('#postList').append(`
            <li>
              <a href="post-detail.html?id=${post.id}">${post.title}</a>
            </li>
          `);
        });
      }
    });
  }

  $('#searchBtn').on('click', () => {
    const keyword = $('#search').val();
    loadPosts(keyword);
  });

  loadPosts();
}

// BUAT/EDIT POSTINGAN
if (window.location.pathname.includes('post.html')) {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (postId) {
    $('#formTitle').text('Edit Postingan');
    $.ajax({
      url: apiUrl + '/posts/' + postId,
      headers: getAuthHeaders(),
      success: function (post) {
        $('#postTitle').val(post.title);
        $('#postContent').val(post.content);
      }
    });
  }

  $('#savePostBtn').on('click', () => {
    const data = {
      title: $('#postTitle').val(),
      content: $('#postContent').val()
    };

    const method = postId ? 'PUT' : 'POST';
    const endpoint = postId ? `/posts/${postId}` : '/posts';

    $.ajax({
      url: apiUrl + endpoint,
      method: method,
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data),
      success: () => {
        alert('Berhasil disimpan');
        window.location.href = 'index.html';
      },
      error: () => alert('Gagal menyimpan')
    });
  });
}

// DETAIL POSTINGAN
if (window.location.pathname.includes('post-detail.html')) {
  const id = new URLSearchParams(window.location.search).get('id');

  function loadPost() {
    $.ajax({
      url: apiUrl + '/posts/' + id,
      headers: getAuthHeaders(),
      success: function (post) {
        $('#detailTitle').text(post.title);
        $('#detailContent').text(post.content);
      }
    });
  }

  function loadComments() {
    $.ajax({
      url: `${apiUrl}/posts/${id}/comments`,
      headers: getAuthHeaders(),
      success: function (comments) {
        $('#commentList').empty();
        comments.forEach(comment => {
          $('#commentList').append(`
            <li>
              ${comment.text}
              <button onclick="deleteComment(${comment.id})">Hapus</button>
            </li>
          `);
        });
      }
    });
  }

  $('#addCommentBtn').on('click', () => {
    const comment = $('#newComment').val();
    $.ajax({
      url: `${apiUrl}/posts/${id}/comments`,
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ text: comment }),
      success: () => {
        $('#newComment').val('');
        loadComments();
      }
    });
  });

  $('#editBtn').on('click', () => {
    window.location.href = `post.html?id=${id}`;
  });

  $('#deleteBtn').on('click', () => {
    if (confirm('Yakin ingin hapus postingan ini?')) {
      $.ajax({
        url: apiUrl + `/posts/${id}`,
        method: 'DELETE',
        headers: getAuthHeaders(),
        success: () => {
          alert('Postingan dihapus');
          window.location.href = 'index.html';
        }
      });
    }
  });

  window.deleteComment = function (commentId) {
    $.ajax({
      url: apiUrl + `/comments/${commentId}`,
      method: 'DELETE',
      headers: getAuthHeaders(),
      success: () => loadComments()
    });
  };

  loadPost();
  loadComments();
}
