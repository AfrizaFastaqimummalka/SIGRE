export async function getMahasiswa(){

const res = await fetch("http://localhost:5000/biodata")

if(!res.ok){
throw new Error("Gagal mengambil data")
}

return res.json()

}