import {createElement, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Button, List, ListItem, Spinner, OverflowMenu, MenuItem, Modal, Icon, IndexPath} from '@ui-kitten/components';
import { getCategorias, getGastos, fillDataRandomly } from '../utils/db'
import { BarChart, LineChart } from 'react-native-chart-kit'
import { normalize } from '../utils/stylesFunctions';
import Loader from '../components/Loader';

/*
const listData = [
    { name: "Bizum", icon: '💸', spent: 200 },
    { name: "Comida", icon: '🥑', spent: 80 },
    { name: "Gasolina", icon: '⛽', spent: 200 },
    { name: "Ocio", icon: '💁', spent: 130 },
    { name: "Gastos Fijos", icon: '💸', spent: 100 },
    { name: "Subscripciones", icon: '💸', spent: 80 },
    { name: "Bizum", icon: '💸', spent: 20 },
    { name: "Comida", icon: '🍲', spent: 80 },
    { name: "Bizum", icon: '💸', spent: 20 },
    { name: "Comida", icon: '🍲', spent: 80 },
]*/
  
const renderListItem = ({ item }) => {
    return(
      <ListItem key={item.name + Math.round(Math.random() * 1000)} style={styles.listItemContainer}
        children=
        { 
        <View style={styles.listItemContainer}>
          <Text style={styles.listItem}>{item.icon} {item.name}</Text>
          <Text style={styles.moneySpent}>{item.spent}€</Text> 
        </View>
        } />
    )
  }

export default function Home(props){

  //Props from react native navigator https://reactnavigation.org/docs
  const { navigation, route } = props;

  //Stores the total waste of money from the actual month
  const [ gastoMensual, setGastoMensual ] = useState(0);

  //Stores a list with the categories and money spent in the actual month
  const [ dataTransformed, setDataTransformed ] = useState([]);

  //Stores all money spent in the actual year, used for the graph
  const [ historicoGastos, setHistoricoGastos ] = useState([]);
  
  //Check if app is loading
  const [ isLoading, setIsLoading ] = useState(true);

  //Save selected month in a number
  const [ selectedMonth, setSelectedMonth ] = useState(new Date().getMonth());
  
  //Shows or hide the modal for selecting the months
  const [ isModalVisible, setIsModalVisible ] = useState(false);

  //Save selected tab TODO: Refactor and do a custom hook and a component
  const [ activeTab, setActiveTab ] = useState(0);

  //Used for the overflow menu(three dots menu)
  const [ showMore, setShowMore ] = useState(false);

  //Stores the idx of the overflow menu(three dots menu)
  const [ showMoreIDX, setShowMoreIDX ] = useState(new IndexPath(0));
  
  //Saves the error in case there is any, TODO: Refactor and make an error handler func
  const [ error, setError ] = useState('');

  //Get width of the window, not the screen(for the graph)
  const width = Dimensions.get('window').width;

  //Variable for reload info

  //Fullname months
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  //Array for getting the names of the month shorted
  //for the graph
  const monthAbbr = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ]

  
  //Buttons rendered
  const ThreeDots = (props) => {
    return <Icon {...props} name={'more-vertical-outline'} />
  }

  const MoreMenuButton = () => {
    return <Button appearance='ghost' status={'basic'} accessoryLeft={ThreeDots} onPress={() => setShowMore(true)} />
  }    

  const AddIcon = (props) => {
    return <Icon {...props} name="plus-outline" /> 
  }

  const Refresh = (props) => {
    return <Icon {...props} name='refresh-outline' />
  }
  //End buttons rendered

  //Fech only info from a month
  const fetchInfo = async (month) => {
    getCategorias()
    .then(async (resultCategorias) => {
      let listData = [];
      let gasto = 0;
      await resultCategorias.map(async (categoria) => {  
        const categoryName = categoria.name;
        const categoryIcon = categoria.icon;
        await getGastos(categoria, month).then((resultGastos) => {
          let sumaTotal = 0;
          if(resultGastos){
            sumaTotal = resultGastos.reduce((a,b) => { return Number(a) + Number(b)});
          }
          gasto += Number(sumaTotal);
          listData.push({ icon: categoryIcon, name:categoryName, spent: sumaTotal});
        })
        .catch((err) => {
          console.log(err);
        })
      })
      setDataTransformed(listData);
      setGastoMensual(String(gasto).replace(".", ","));
    })
    .catch((err) => {
      console.log(err);
    })
  }

  //Function for getting all info store in the year
  const getDataHistoricoGastos = async () => {
    let monthData = [];
    const categorias = await getCategorias();
    let gasto = 0;
    await months.map(async (month, monthIdx) => {
      await categorias.map(async (categoria, categoriaIdx) => {
        const categoryName = categoria.name;
        const gastosForChart = await getGastos(categoria, monthIdx);
        let sumaTotal = 0;
        if(gastosForChart){
          sumaTotal = gastosForChart.reduce((a,b) => Number(a) + Number(b));
        }
        gasto += Number(sumaTotal)
      })
      monthData[monthIdx] = gasto;
      gasto = 0
    })
    setHistoricoGastos(monthData);
  }

  //Function for ordering the list
  const orderBy = (indexOrder) => {
    let copyList = [];
      const optsArr = [
        "ORDER_ASC",
        "ORDER_DESC"
      ];
      
      switch(optsArr[indexOrder]){
        case 'ORDER_ASC':
          return [...dataTransformed].sort((a, b) => a.spent - b.spent );
        
        case 'ORDER_DESC':
          return [...dataTransformed].sort((a,b) => b.spent - a.spent);
      }
  }

  //Use it for testing the app
  useEffect(() => { 
    console.log("--> Fetching data");
    setIsLoading(true);
    try{
      fetchInfo(selectedMonth);
      getDataHistoricoGastos();
    }catch(err){
      setError(err);
    }
    setIsLoading(false);
  }, [])
  
  //Initial load, when user clicks on the refresh button or when user select a new month
  useEffect(() => {
      setIsLoading(true);
      try{
        fetchInfo(selectedMonth);
        getDataHistoricoGastos();
      }catch(err){
        setError(err);
      }
      setIsLoading(false);
      navigation.setParams({ update: false });
  }, [selectedMonth])

  //Set the data from the list into a new one sorted
  useEffect(() => {
    setDataTransformed(orderBy(showMoreIDX.row));
  }, [showMoreIDX])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (<Button status='basic' appearance='ghost' onPress={() => navigation.setParams({ update: true })} accessoryRight={Refresh} />),
      headerRight: () => (<Button status='basic' appearance='ghost' onPress={() => navigation.navigate('AddPayment')} accessoryLeft={AddIcon} />)
    })
  }, [ navigation])

  useEffect(() => {
    if(route.params.update){
      console.log("--> New data added, updating...");
      setIsLoading(true);
      try{
        fetchInfo(selectedMonth);
        getDataHistoricoGastos();
      }catch(err){
        setError(err);
      }
      setIsLoading(false);
      navigation.setParams({ update: false });
    }
  }, [route]);

  //Main screen, first tab
  const GastosComponent = () => {
    return(
      <>
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <Text style={styles.subtitle}>Dinero gastado</Text>
          <TouchableOpacity style={styles.buttonMonth} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.subtitleAction}>{months[selectedMonth] + ' ' + new Date().getFullYear()}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[ {flex: 0}, styles.bigBold]}>{gastoMensual}€</Text>
      </View>
      <View style={styles.sections}>
        <View style={{ flex: 0, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <Text style={styles.subtitle}>Desglose</Text>
          <OverflowMenu
            anchor={MoreMenuButton}
            visible={showMore}
            selectedIndex={showMoreIDX}
            onSelect={(index) => { setShowMoreIDX(index); setShowMore(false) }}
            onBackdropPress={() =>  setShowMore(false)}>
              <MenuItem title={'De menos a mas'}/>
              <MenuItem title={'De mas a menos'}/>
          </OverflowMenu>
        </View>
        {dataTransformed && dataTransformed.length > 0 ? (<List style={styles.list} data={dataTransformed} renderItem={renderListItem} />) : (<Text style={styles.listItem}>No hay datos</Text>)}
      </View>
      <Modal 
        visible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{width: '80%', height: 'auto', backgroundColor: 'white', padding: 20, borderRadius: 10}}        
        backdropStyle={{backgroundColor: 'rgba(0,0,0,0.5)'}}
      >
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItem: 'center' }}>
        {months.map((month, idx) => {
          return(
          <TouchableOpacity key={month+idx} onPress={() => {setSelectedMonth(idx); setIsModalVisible(false)}} style={{ flexBasis: '45%', alignItems: 'center', padding: 20, backgroundColor: '#ebebeb', borderRadius: 10 }}>
            <Text style={{ color: '#4a4e69',fontWeight: 'bold',fontSize: normalize(6)}}>{month}</Text>
          </TouchableOpacity>)
        })}
        </View>
      </Modal> 
      </>
    )
  }

  //Graph screen, second tab
  const GraficosComponent = () => {
    const exampleData = {
      labels: monthAbbr,
      datasets: [
        {
          data: historicoGastos && historicoGastos.length > 0 ? historicoGastos : Array(12).fill(0),
          color: (opacity = 1) => `rgba(74, 78, 105, ${opacity})`,
        }
      ]
    }

    const chartConfig = {
      backgroundColor: "#fff",
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      barRadius: 5,
      strokeWidth: 0,
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 0.9) => `#4a4e69`,
      labelColor: (opacity = 1) => `#4a4e69`,
      barPercentage: 0.5
    };

    return (
      <>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Historico gastos</Text>
          <BarChart
            data={exampleData} 
            width={width-30} 
            height={350} 
            yAxisLabel={'€'} 
            withInnerLines={false}
            fromNumber={false}
            fromZero={false}
            yLabelsOffset={10}
            segments={8}
            chartConfig={chartConfig}/>
        </View>
      </>
    )
  }

  //Where components are stored and then created
  //Every tab should be here
  const itemsTab = [
    GastosComponent,
    GraficosComponent
  ]

  return(
    isLoading ? (<Loader />) : (
    <View style={styles.container}> 
      <View style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
        <TouchableOpacity key={'gastos'+0} style={activeTab === 0 ? styles.activeTab : styles.inactiveTab} onPress={() => setActiveTab(0)}>
          <Text style={[styles.tabItem, activeTab === 0 ? styles.white : styles.darkblue ]}>Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity key={'graficos'+1}style={activeTab === 1 ? styles.activeTab : styles.inactiveTab} onPress={() => setActiveTab(1)}>
          <Text style={[ styles.tabItem, activeTab === 1 ? styles.white : styles.darkblue ]}>Gráficos</Text>
        </TouchableOpacity>
      </View>
      {createElement(itemsTab[activeTab])}
    </View>)
  )
}

//Stilos de la aplicacion
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "black",
  },
  sections: {
    flex: 1,
    justifyContent: "flex-start",
    alignSelf: "flex-start",
    margin: 20,
    width: "90%",
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'column',
    marginTop: '5%'
  },
  bigBold: {
    fontWeight: "bold",
    color: "#4a4e69",
    fontSize: normalize(30),
    maxHeight: 400,
    margin: 25,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: normalize(8),
    color: "#b0b0b0b0",
    paddingBottom: 10,
  },
  list: {
    backgroundColor: "white",
    maxHeight: 400,
  },
  moneySpent: {
    color: "#06d6a0",
    fontWeight: "bold",
    fontSize: normalize(6),
  },
  listItem: {
    color: "#4a4e69",
    backgroundColor: "white",
    fontWeight: "bold",
    fontSize: normalize(6),
  },
  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  monthSelector: {
    flex: 0,
    justifyContent: "center",
    alignItems: 'flex-end',
    flexDirection: "row",
    padding: 0,
  },
  buttonMonth: {
    padding: 10,
  },
  subtitleAction: {
    fontWeight: "bold",
    fontSize: normalize(8),
    color: "#b0b0b0b0",
    textDecorationLine: "underline"
  },
  white: {
    color: "white",
  },
  darkblue: {
    color: "#4a4e69",
  },
  tabItem: {
    fontSize: normalize(6),
  },
  activeTab: {
    flex: 1,
    height: 50,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#4a4e69",
    color: "white",
    borderRadius: 10,
  },
  inactiveTab: {
    flex: 1,
    height: 50,
    alignItems: "center",
    padding: 15,
    color: "#4a4e69",
    borderRadius: 10,
  },
});