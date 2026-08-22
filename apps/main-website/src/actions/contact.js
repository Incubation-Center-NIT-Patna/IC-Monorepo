"use server";

export async function submitContactForm(formData) {
  const errors = {};
  
  const name = formData.name?.trim() || '';
  if (!name) {
    errors.name = "Full Name can't be blank";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  const email = formData.email?.trim() || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "Email Address can't be blank";
  } else if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  const phone = formData.phone?.trim() || '';
  const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
  if (!phone) {
    errors.phone = "Phone Number can't be blank";
  } else if (!phoneRegex.test(phone)) {
    errors.phone = "Please enter a valid phone number (at least 10 characters)";
  }

  const subject = formData.subject?.trim() || '';
  if (!subject) {
    errors.subject = "Subject can't be blank";
  } else if (subject.length < 3) {
    errors.subject = "Subject must be at least 3 characters";
  }

  const message = formData.message?.trim() || '';
  if (!message) {
    errors.message = "Message can't be blank";
  } else if (message.length < 10) {
    errors.message = "Message must be at least 10 characters";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const accessKey = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY;
  
  if (!accessKey) {
    return { success: false, message: "Web3Forms access key is not configured." };
  }
  
  return { success: true, accessKey };
}
