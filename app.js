import {createServer} from "http";
import { readFile,writeFile } from "fs/promises";
import path from "path";
const PORT = 3000;
const DATA_FILE = path.join("data","links.json");
const loadLinks = async() =>{
    try {
        const data = await readFile(DATA_FILE,"utf-8");
        return JSON.parse(data);
    } catch (error) {
        if(error.code === "ENOENT"){
            await writeFile(DATA_FILE,JSON.stringify({}))
            return {};
        }
        throw error;
    }
}
const saveLinks = async(links) => {
    await writeFile(DATA_FILE,JSON.stringify(links),"utf-8");
        console.log("File updated");
}
const server = createServer(async(req,res)=>{
    console.log(req.url);
    if(req.method === "GET"){
        if(req.url === "/"){
            try {
                const data = await readFile(path.join("public","index.html"));
                res.writeHead(200,{"Content-type":"text/html"});
                res.end(data);
            } catch (error) {
                res.writeHead(404,{"Content-type":"text/html"});
                res.end("404 page not found");
            }
        }else if(req.method === "GET"){
        if(req.url === "/style.css"){
            try {
                const data = await readFile(path.join("public","style.css"));
                res.writeHead(200,{"Content-type":"text/css"});
                res.end(data);
            } catch (error) {
                res.writeHead(404,{"Content-type":"text/css"});
                res.end("404 page not found");
            }
        }else if(req.url ==="/links"){
        const links = await loadLinks();
        res.writeHead(200,{"Content-Type":"application/json"});
            return res.end(JSON.stringify(links));

    }else{
        const links = await loadLinks();
        const shortCode = req.url.slice(1);
        console.log("Links redirect",req.url);
        if(links[shortCode]){
            res.writeHead(302,{location : links[shortCode]});
            return res.end();
        }
        res.writeHead(404,{"Content-Type":"text/plain"});
            return res.end("Shortened URL is not found");
    }
        }
    }
    if(req.method === "POST" && req.url === "/shorten"){
        const links = await loadLinks();
        let body = "";
        req.on("data",(chunk) =>(body = body + chunk))
        req.on('end',async() => {
            console.log(body);
            const {url,shortCode} = JSON.parse(body);
            if(!url){
                res.writeHead(400,{"Content-Type":"text/plain"});
                return res.end("URL is required");
            }
            const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
            if(links[finalShortCode]){
                res.writeHead(400,{"Content-Type":"text/plain"});
                return res.end("Short code already exists please choose another");
            }
            links[finalShortCode] = url;
            await saveLinks(links);
                res.writeHead(200,{"Content-Type":"application/json"});
                res.end(JSON.stringify({success:true,shortCode:finalShortCode}));

        })
    }
})
server.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);

})