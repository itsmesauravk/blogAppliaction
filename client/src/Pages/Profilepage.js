import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import './Profilepage.css';

function Profilepage() {
  // State to hold user information
  const [userInfo, setUserInfo] = useState(null);

  const [blogs, setBlogs] = useState([]);

  // Fetch user information from an API endpoint
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/user-info', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('blogUserToken')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUserInfo(data.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:4000/user-blog', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('blogUserToken')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className='main-div'>
        <div className="profile-page">
          <h1>Profile</h1>
          {userInfo && userInfo ? (
            <div className="user-info">
              <p><strong>Name:</strong> {userInfo.firstname}</p>
              <p><strong>Last Name:</strong> {userInfo.lastname}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> {userInfo.role}</p>
            </div>
          ) : (
            <p className="loading-message">Loading user information...</p>
          )}
        </div>
        <div className='profile-blogs'>
          {blogs && blogs.length > 0 ? (
            <div className="blog-list">
              {blogs.map((blog) => (
                <div key={blog._id} className="blog">
                  <h3>{blog.title}</h3>
                  <p>{blog.content}</p>
                  <p>By: {blog.user.firstname} {blog.user.lastname}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="loading-message">Loading your blogs...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default Profilepage;
