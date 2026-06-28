let captcha = "";
// ======================
// DEFAULT USER
// ======================

let users =
JSON.parse(localStorage.getItem("users")) || [];

if(users.length === 0){

    users.push({

        nama:"Owner",

        username:"owner",

        password:"owner123",

        level:"Owner",

        status:"Aktif"

    });

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

}

function generateCaptcha(){

const chars =
"ABCDEFGHJKLMNPQRSTUVWXYZ123456789";

captcha = "";

for(let i=0;i<6;i++){

captcha += chars.charAt(
Math.floor(
Math.random()*chars.length
)
);

}

document.getElementById(
"captchaText"
).innerHTML = captcha;

}

generateCaptcha();

document
.getElementById("loginForm")
.addEventListener("submit",function(e){

e.preventDefault();

let username =
document.getElementById(
"username"
).value;

let password =
document.getElementById(
"password"
).value;

let inputCaptcha =
document.getElementById(
"captchaInput"
).value;

if(inputCaptcha !== captcha){

alert("Captcha salah");

return;

}

// Ambil data user
let users =
JSON.parse(localStorage.getItem("users")) || [];

// Cari user
let user = users.find(item =>
    item.username === username &&
    item.password === password
);

if(!user){

    alert("Username atau Password Salah");

    return;

}

if(user.status === "Nonaktif"){

    alert("User sudah dinonaktifkan.");

    return;

}

localStorage.setItem(
    "login",
    "true"
);

// Simpan user yang sedang login
localStorage.setItem(
    "userAktif",
    JSON.stringify(user)
);

window.location.href =
"pages/dashboard.html";

});

const togglePassword =
document.getElementById(
    "togglePassword"
);

const passwordInput =
document.getElementById(
    "password"
);

togglePassword.addEventListener(
    "click",
    function(){

        const type =
        passwordInput.getAttribute(
            "type"
        ) === "password"
            ? "text"
            : "password";

        passwordInput.setAttribute(
            "type",
            type
        );

        this.classList.toggle(
            "fa-eye"
        );

        this.classList.toggle(
            "fa-eye-slash"
        );

    }
);

document.addEventListener(
    "mousemove",
    function(e){

        if(Math.random() > 0.5){

            const bubble =
            document.createElement("div");

            bubble.classList.add(
                "bubble"
            );

            bubble.style.left =
            e.clientX + "px";

            bubble.style.top =
            e.clientY + "px";

            document.body.appendChild(
                bubble
            );

            const size =
            Math.random() * 20 + 10;

            bubble.style.width =
            size + "px";

            bubble.style.height =
            size + "px";

            setTimeout(()=>{
                bubble.remove();
            },1500);

        }

    }
);

function createFloatingBubble(){

    const container =
    document.querySelector(
        ".bubbles"
    );

    const bubble =
    document.createElement(
        "div"
    );

    bubble.classList.add(
        "bubble-float"
    );

    const size =
    Math.random() * 50 + 15;

    bubble.style.width =
    size + "px";

    bubble.style.height =
    size + "px";

    bubble.style.left =
    Math.random() * 100 + "%";

    bubble.style.animationDuration =
    (Math.random() * 8 + 8) + "s";

    container.appendChild(
        bubble
    );

    setTimeout(()=>{
        bubble.remove();
    },16000);

}

setInterval(
    createFloatingBubble,
    700
);