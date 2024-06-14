import express from "express";
import axios from "axios";
import bodyParser from "body-parser"

const app = express();
const port = 3000;
const URL = "https://openlibrary.org"

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


function Book(coverID, title, authorName, key, authorKey){
    this.coverID = coverID;
    this.title = title;
    this.authorName = authorName;
    this.key = key;
    this.authorKey =authorKey;
}

let booksArray = [];

app.get("/", (req, res)=>{
    res.render("index.ejs"); 
});

app.post("/title", async (req, res)=>{
    booksArray=[];
    try {       
        const result = await axios.get("https://openlibrary.org/search.json",{
            params:{
                q: req.body.search
            }
        });
        let resultArray = result.data.docs;
        resultArray.forEach(async item => {
            let book = new Book(
                item.cover_i,
                item.title,
                item.author_name,
                item.key.slice(7),
                item.author_key
            );
            booksArray.push(book);
        });
         console.log(booksArray[0]);
        // console.log(result.data.docs[0].author_name);
        res.render("index.ejs", {books: booksArray});
    } catch (error) {
        res.render("index.ejs");    
    }   
});

app.get("/view-book/:key/:cover/:author", async (req, res)=>{
    console.log(req.params.author);
    try {
        const result = await axios.get("https://openlibrary.org/works/"+ req.params.key +".json",{ });
        const reviews = await axios.get("https://openlibrary.org/works/"+ req.params.key +"/ratings.json",{ });
        const author = await axios.get("https://openlibrary.org/authors/" + req.params.author + ".json",{ });
        const data = {
            title: result.data.title,
            description: result.data.description,
            cover: req.params.cover,
            author: author.data,
            authorKey: req.params.author,
            review: reviews.data
        }
        console.log(data);
        res.render("works.ejs",data); 
    } catch (error) {
        console.log(error.response.status)
        res.render("error.ejs",{error: error.response.status}); 
    } 
});


app.listen(port, ()=>{
    console.log(`listening at port ${port}`);
});