document.getElementById("recover-btn").addEventListener("click", function () {
    const emailInput = document.getElementById("email").value;
    const hasNumber = /\d/.test(emailInput);

    if (hasNumber) {
        // Chuyển sang trang reset password
        window.location.href = "ResetPassword.html";
    } else {
        alert("Vui lòng nhập email hoặc username có ít nhất 1 số!");
    }
});
