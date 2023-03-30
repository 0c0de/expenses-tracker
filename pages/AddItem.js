import { useEffect, useState, useCallback } from 'react';
import Toast from 'react-native-toast-message'
import { StyleSheet, TextInput, View, SafeAreaView } from 'react-native';
import { Button, Icon, Input, Modal, Select, SelectItem, Text, IndexPath} from '@ui-kitten/components';
import EmojiPicker from 'rn-emoji-keyboard';
import { getCategorias, addCategorias, clearData, addGastos } from  '../utils/db'
import { normalize } from '../utils/stylesFunctions';
import { Switch }from '../components/Switch'

const Done = (props) => {
    return <Icon {...props} name='checkmark-outline' />
}

const GoBack = (props) => {
    return <Icon {...props} name="arrow-back-outline" /> 
}

const IngresoIcon = (props) => {
    return <Icon {...props} name="trending-up-outline" />
}

const CobroIcon = (props) => {
    console.log(props)
    return <Icon {...props} name="trending-down-outline" />
}

export default function AddItem(props){
    const { navigation, route } = props;
    const [ isModalVisible, setIsModalVisible ] = useState(false);
    const [ categorias, setCategorias ] = useState([]);
    const [ moneySpent, setMoneySpent ] = useState('');
    const [ selectedCategoriaIDX, setSelectedCategoriaIDX ] = useState(new IndexPath(0));
    const [ error, setError ] = useState('');
    const [ icon, setIcon ] = useState('');
    const [ categoryName, setCategoryName ] = useState('');
    const [ showEmoji, setShowEmoji ] = useState(false);
    const [ typeOfPayment, setTypeOfPayment ] = useState('');
    const savePayment = () => {
        
        const fecha = new Date();
        console.log(categorias, selectedCategoriaIDX);
        const objToSave = 
        { 
            moneySpent: moneySpent.includes(",") ? moneySpent.replace(",", ".") : moneySpent, 
            category: { 
                icon: categorias && categorias.length > 0 ? categorias[selectedCategoriaIDX.row].icon : '', 
                name: categorias && categorias.length > 0 ? categorias[selectedCategoriaIDX.row].name : '' 
            }
        }
        console.log('--> ObjToSave: ', objToSave);
        addGastos(objToSave, fecha.getMonth()).then((result) => {
            console.log('Gastos guardados', result);
            Toast.show({ type: 'successToast', text1: 'Dinero guardado 😉' });
            setMoneySpent('');
        })
        .catch((err) => {
            console.error(err);
        });
    }
    
    const saveCategory = () => {
        addCategorias({ icon: icon, name: categoryName })
        .then((result) => {  
            setIsModalVisible(false); 
            setCategoryName(''); 
            setIcon(''); 
        })
        .catch((err) => { console.log(err) });
    }

    const ModalSaveCategory = () => {
        return (
            <Modal 
                visible={isModalVisible}
                style={{width: '80%', height: 'auto', backgroundColor: 'white', padding: 20, borderRadius: 10}}
                onBackdropPress={() => setIsModalVisible(false)}
                backdropStyle={{backgroundColor: 'rgba(0,0,0,0.5)'}}
            >
                <Input value={icon} onPressIn={(e) => {setShowEmoji(true);}} keyboardType='twitter' label={'Icono de la categoría'} placeholder='🥑' onChangeText={(e) => setIcon(e)} />
                <View style={{margin: 10}}></View>
                <Input value={categoryName} label={'Nombre de la categoría'} placeholder='Bizum, Ocio, Super...' onChangeText={(e) => setCategoryName(e)} />
                <View style={{margin: 10}}></View>
                <Button style={styles.buttonCustom} onPress={saveCategory} status='info' appearance='outline' accessoryLeft={<Icon name='save-outline' />}>Guardar</Button>
            </Modal>
        )
    }

    useEffect(() => {
        getCategorias().then((categorias) => {
            setCategorias(categorias);
            console.log(categorias);
        })
        .catch((err) => {
            console.log(err);
        })
    }, []);

    useEffect(() => {
        navigation.setOptions({
          headerRight: () => (<Button status='basic' appearance='ghost' onPress={() => savePayment()} accessoryLeft={Done} /> ),
          headerLeft: () => (<Button status='basic' appearance='ghost' onPress={() => navigation.navigate('Home', { update: true })} accessoryLeft={GoBack} />)
        })
      }, [navigation, moneySpent, selectedCategoriaIDX])

    useEffect(() => {
        getCategorias().then((categorias) => {
            setCategorias(categorias);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [isModalVisible]);

    
    const PayExpenseComponent = () => {
        return (
            <>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Ingrese lo que ha gastado</Text>
                    <View style={styles.inputView}>
                        <TextInput value={moneySpent} onChangeText={(text) => setMoneySpent(text)} keyboardType={'number-pad'} cursorColor='black' placeholder='25' style={styles.inputText}/>
                        <Text style={styles.inputText}>€</Text>
                    </View>
                </View>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Introduzca la categoría </Text>
                    <View style={{ paddingBottom: 10 }}></View>
                    {categorias && categorias.length > 0 ? 
                    <Select
                        style={styles.selectStyle}
                        selectedIndex={selectedCategoriaIDX}
                        placeholder={'Bizum, Ocio, Comida...'}
                        value={categorias[selectedCategoriaIDX.row].icon + ' ' + categorias[selectedCategoriaIDX.row].name}
                        onSelect={index => {setSelectedCategoriaIDX(index)} }>
                        {categorias.map((categoria,idx) => {
                            return(
                                <SelectItem key={categoria.name+idx} title={categoria.icon + ' ' + categoria.name} />
                            )
                        } )}
                        
                    </Select> : null}
                    <Button style={styles.buttonCustom} appearance='outline' status='info' onPress={() => setIsModalVisible(!isModalVisible)} accessoryLeft={<Icon name='plus-outline' />} >Añadir categoria</Button>
                </View>
            </>
        )
    }

    const tabs = [
        { name: 'Pago', icon: "trending-down-outline" },
        { name: 'Ingreso', icon: "trending-up-outline" }
    ]

    return(
        <View style={styles.container}>
            <Switch valueSelected={(e) => setTypeOfPayment(tabs[e].name)} componentsForTabs={tabs}/>
            <ModalSaveCategory />
            <EmojiPicker enableSearchBar onEmojiSelected={(e) => {setIcon(e.emoji); setShowEmoji(false);}} open={showEmoji} onClose={() => console.log('KeyboardClosed')}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 600,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputText:{
        marginTop: 30,
        fontSize: normalize(40),
        fontWeight: 'bold',
        color: '#4a4e69'
    },
    inputView:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    selectStyle:{
        marginBottom: 30,
        width: '100%'
    },
    subtitle:{
        fontWeight: 'bold',
        color: '#4a4e69'
    },
    buttonCustom: {
        borderColor: '#4a4e69',
        color: '#4a4e69',
        backgroundColor: '#ebecf2'
    }
})