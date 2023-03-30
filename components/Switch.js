import { useEffect, useState, createElement } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Icon } from "@ui-kitten/components";
import { normalize } from '../utils/stylesFunctions'

export default function Switch({ componentsForTabs, valueSelected }){

    const [ idxSelected, setIdxSelected ] = useState(0);

    useEffect(() => {
        console.log(idxSelected);
        valueSelected(idxSelected);
    }, [idxSelected])

    return(
        <>
            <View style={styles.container}>
            { componentsForTabs.map((val, idx) => {
                return (
                    <SwitchSelector activeTab={idxSelected} selectedIdx={(e) => {console.log(e); setIdxSelected(e)}} idx={idx} title={val.name} icon={val.icon ? val.icon : null} />
                )
            }) }
            </View>
        </>
    )
}

function SwitchSelector({ title, icon, selectedIdx, activeTab, idx }){
    return(
        <TouchableOpacity 
            style={[styles.tabItem, activeTab ==  idx ? styles.activeTab : styles.inactiveTab]}
            key={title+parseInt(Math.random() * 1000).toString()}
            onPress={() => selectedIdx(idx)}
        >
            <View style={{ flex: 1, flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center'}}>
                <View style={{height: 30, width: 30}}><Icon name={icon} fill={activeTab == idx ? styles.white.color : styles.darkblue.color}/></View>
                <Text style={[ activeTab == idx ? styles.white : styles.darkblue ]}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 0,
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: 'row'
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
    white: {
        color: "white",
    },
    darkblue: {
        color: "#4a4e69",
    },
    tabItem: {
        fontSize: normalize(6),
        margin: 10
    },
})