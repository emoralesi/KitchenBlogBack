export const compareRecetas = (obj1, obj2) => {
    if (
        obj1.titulo !== obj2.titulo ||
        obj1.cantidadPersonas !== obj2.cantidadPersonas ||
        obj1.descripcion !== obj2.descripcion ||
        obj1.hours !== obj2.hours ||
        obj1.minutes !== obj2.minutes ||
        obj1.categoria !== obj2.categoria.toString() ||
        obj1.dificultad !== obj2.dificultad.toString() ||
        JSON.stringify(obj1.grupoIngrediente.sort()) !== JSON.stringify(obj2.grupoIngrediente.map(element => element.toString()).sort()) ||
        JSON.stringify(obj1.images.sort()) !== JSON.stringify(obj2.images.sort()) ||
        JSON.stringify(obj1.pasos.sort()) !== JSON.stringify(obj2.pasos.map(element => element.toString()).sort()) ||
        JSON.stringify(obj1.subCategoria.sort()) !== JSON.stringify(obj2.subCategoria.map(element => element.toString()).sort()) ||
        JSON.stringify(obj1.utencilio.sort()) !== JSON.stringify(obj2.utencilio.map(element => element.toString()).sort())
    ) {
        return false
    } else {
        return true
    }
}