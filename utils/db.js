import { MMKVLoader } from 'react-native-mmkv-storage';

//Init mmkv for categories
const storageCategorias = new MMKVLoader().withEncryption().withInstanceID('categorias').initialize();
const storageGastos = new MMKVLoader().withEncryption().withInstanceID('gastos').initialize();

const actualYear = new Date().getFullYear();

const getCategorias = () => {
    return new Promise((resolve, reject) => {
        storageCategorias.getArray('categorias', (err, val) => {
            if(err)
                reject(err);

            if(!val)
                resolve([]);

            resolve(val);
        });
    })
}

const getGastos = (categoria, month) => {
    return new Promise((resolve, reject) => {
        const dateToLook = month.toString() + actualYear.toString();
        const key = categoria.name + dateToLook.toString();
        storageGastos.getArray(key, (err, val) => {
            if(err)
                reject(err);

            resolve(val);
        });
    })
}

const addCategorias = ({ icon, name }) => {
    return new Promise((resolve, reject) => {
        getCategorias().then((categorias) => {
            const categoryToSave = { icon, name };
            let copy;

            if(!categorias){
                copy = [categoryToSave];
            }else{
                copy = [...categorias, categoryToSave];
            }
            storageCategorias.setArray('categorias', copy) ? resolve({ categorias: copy }) : reject('error saving category');
        })
        .catch((err) => {
            reject(err);
        })
    })
}

const addGastos = ({ moneySpent, category }, month) => {
    return new Promise((resolve, reject) => {
        getGastos(category, month).then((gastos) => {
            const moneyToSave = moneySpent;
            let copy;
            if(!gastos){
                copy = [moneyToSave];
            }else{
                copy = [...gastos, moneyToSave];
            }

            const dateToLook = month.toString() + actualYear.toString();
            const key = category.name + dateToLook.toString();
            storageGastos.setArray(key, copy) ? resolve({ category, dataSaved: copy }) : reject('error saving money');
        })
        .catch((err) => {
            reject(err);
        })
    })
}

const clearData = () => {
    storageCategorias.clearMemoryCache();
    storageCategorias.clearStore();
    storageGastos.clearMemoryCache();
    storageGastos.clearStore();
}

const clearKey = (key) => {
    storageGastos.removeItem(key);
}

const fillDataRandomly = async (month) => {
    const categorias = await getCategorias();
    categorias.map(async (val, idx) => {
        const resultGastos = await addGastos({ moneySpent: Number(Math.random() * 100).toFixed(1), category: val.name}, month);
        console.log(resultGastos);
    })
}

module.exports = { getCategorias, addCategorias, getGastos, addGastos, clearData, clearKey, fillDataRandomly }