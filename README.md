# Search Engine
A Search Engine that I created for my Intelligent Web-Based Systems class.


## Main Features
- Indexed page information were gathered by crawling the respective pages using the 'crawler' package from NPM.
- The pages were crawled recursively using deapth first search. (follow all the useful links a given page has in deapth first order)
- Crawled information is stored in mongodb for persistance.
- Pages are indexed using the NPM package elasticlunr.
- Importance of the crawled pages are calculated using the PageRank algorithm. (Proposed by Brin/Page in 1998, foundation of Google search)
- The server is built following REST design principles.
- ReactJS front-end for this project: [ReactJS-client-searchEngine](https://github.com/Tharindu-h/ReactJS-client-searchEngine)


### I'm hoping to improve this project when I have a little more free time by:
- Crawling and indexing all of the linux man pages (currently its limited to 1000 pages)