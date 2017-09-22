

const parseCookies = (req, res, next) => {
  req.cookies = req.cookies ? req.cookies : {}; 

  let cookies = [];
  let cookieObj = {};
  if (req.headers.cookie) {  
    const cookieArr = req.headers.cookie.split('; '); 
    cookieArr.forEach(element => {
      cookies.push(element.split('='));
    });
    cookies.forEach(element => {
      cookieObj[element[0]] = element[1];
    });
    req.cookies = cookieObj;
  } 
  next();
};

module.exports = parseCookies;