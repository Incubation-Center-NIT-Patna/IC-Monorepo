 

const Scroll = () => {

window.addEventListener("scroll",function(){
    var header = this.document.querySelector("header");
    header.classList.toggle("sticky",this.window.scrollY > 0);
})
}

export default Scroll;