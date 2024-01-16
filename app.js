const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./Schemas/movies')

const app = express()


app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'http://movies.com'
        ]
        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }
        if (!origin) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    }
}))
app.disable('x-powered-by')



//todos los recursos que sean movies se identificara como /movies
//si nosootros en la peticion añadimos/movies?genre=Action&search o mas con el req.query podemos recuperar esos parametros
app.get('/movies', (req, res) => {
    // res.header('Access-Control-Allow-Origin', '*')
    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            // movie => movie.genre.includes(genre) //esto esta bien pero tenemos problemas si se pone en minuscula
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()) // con esto comparamos todo en minusculas.
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: 'movie not found' })
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    //esto no seria RESt, por que estamos guardando 
    // el estado de la applicacion en memoria

    movies.push(newMovie)

    res.status(201).json(newMovie)

})

app.delete('/movies/:id', (req, res) => {

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: ' Movie deleted' })
})
app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(404).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (!movieIndex === -1) {
        return res.status(404).sjon({ message: 'Movie not found' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)

})



const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})

