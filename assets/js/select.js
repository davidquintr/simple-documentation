let codeElements
let linksRel = document.querySelectorAll("a");
let originRoutes = []

linksRel.forEach((element, index) => {
    originRoutes.push(element.getAttribute('href'))
    element.setAttribute('href', `?post=${originRoutes[index]}`)

    element.addEventListener('click', function(event) {
        event.preventDefault();
        setUrlParam(originRoutes[index])
        const url = originRoutes[index].replaceAll('_', '/');
        console.log(url)
        setMarkedLink(this)
        this.classList.add("bg-[#00000012]");
        convertLight(url);
    });
});

function setUrlParam(url) {
    const newURL = new URL(window.location.href);
    
    if (newURL.searchParams.has("post")) {
        newURL.searchParams.set("post", url);
    } else {
        newURL.searchParams.append("post", url);
    }

    history.pushState({}, "", newURL);

    return newURL.href;
}

function setMarkedLink(element){
    linksRel.forEach((otherElement) => {
        if (otherElement !== element) {
            otherElement.classList.remove("bg-[#00000012]");
        }
    });
}

function foundElementLink(text){
    return Array.from(linksRel).find(e => e.children[1] == undefined ? e.children[0].innerText == text : e.children[1].innerText == text)
}

function convertLight(filePath){
    const urlParams = new URLSearchParams(window.location.search);
    let postParam = urlParams.get('post');

    if(filePath == null && postParam != undefined){
        postParam = postParam.replaceAll('_', '/')
        console.log(postParam)
        filePath = `./assets/tab/${postParam}.md`
    } else {
        filePath = filePath != null ? `./assets/tab/${filePath}.md` : './assets/tab/introduction.md';  
    }

    let textcat = ""

    console.log(filePath)
    fetch(filePath)
        .then(response => response.text())
        .then(fileContent => {
            textcat = fileContent;
            
            var converter = new showdown.Converter({tables: true, tasklist: true})
            var html = converter.makeHtml(textcat)
            document.querySelector("#text").innerHTML = html;

            let codeElements = document.querySelectorAll('code')
            codeElements.forEach((element, index) => {
                Prism.highlightAll(element);
            })

            let title = document.querySelector("#text").children[0]
            let ubiTitle = title.getBoundingClientRect()
            let ubiYTitle = ( ubiTitle.top + window.scrollY) - 74

            window.scrollTo({
                top: ubiYTitle,
                behavior: 'smooth'
            });
            
            document.title = title.innerText
            let navElement = foundElementLink(title.innerText)
            navElement.classList.add("bg-[#00000012]");           
            setMarkedLink(navElement)

        })
        .catch(error => {
            textcat = 'Error al cargar el archivo: ' + error.message;
    });

}

document.addEventListener('DOMContentLoaded', convertLight(null))

window.addEventListener('popstate', () => {
    const paramSearch = new URLSearchParams(window.location.search);
    let post =  paramSearch.get("post") == null ? null : paramSearch.get("post").replaceAll("_","/")
    convertLight(post == null ? null : `${post}`)
})