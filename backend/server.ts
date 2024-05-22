import express from 'express';
import cors from 'cors'
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'

const app = express();
const port = 3000

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

let userData: Array<Record<string, string>> = []

app.use(cors()) //Enable CORS

app.post('/api/files', upload.single('file'), async (req, res) => {
//1. Extrat fil from request
const { file } = req;
//2. Validate that we have file
if(!file) {
    return res.status(500).json({message: "Error no se encontro el archivo"});
}
//3. Validate the mimetype (csv)
if(file.mimetype!== 'text/csv') {
    return res.status(500).json({message: "El formato de archivo no es compatible"});
}
//4. Transform the file (Buffer de datos) to strin
let json: Array<Record<string, string>> = []
try {
 const rawCsv = Buffer.from(file.buffer).toString('utf8');
 
 //5. Transform the string to JSON
json = csvToJson.fieldDelimiter(',').csvStringToJson(rawCsv)
} catch (error) {
    return res.status(500).json({message: 'Error parsing the file'})
}
//6. Save the JSON to db.
userData = json
//7. Return 200 with the message and the JSON-
return res.status(200).json({data: json, messsage: 'Se subió el archivo correctamente'})
})

app.get('/api/users', async (req, res) => {
    //1. Extract the query param 'q' from the request.
    const { q } = req.query
    //2. Validate that we have the query param.
    if (!q) {
        return res.status(500).json({message: 'Query param `q` is required'})
    }

    if (Array.isArray(q)) {
        return res.status(500).json({message: 'Query param `q` tiene que ser un string'})
    }
    //3. filter the data from the db (or memory) with the query param
    const search = q.toString().toLowerCase()

    const filteredData = userData.filter((row) => {
    return Object
            .values(row)
            .some(value => value.toLowerCase().includes(search))
    })
    //4. return 200 with the filtered data

    return res.status(200).json({ data: filteredData });
})

app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
})