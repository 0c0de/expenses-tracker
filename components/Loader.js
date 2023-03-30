import { View, Text, StyleSheet } from "react-native";
import { Spinner } from "@ui-kitten/components";
import { normalize } from '../utils/stylesFunctions';

export default function Loader(){
    return (
        <View style={styles.container}>
            <Spinner status="info" />
            <Text style={styles.listItem}>Cargando la app...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      color: "black",
    },
    listItem:{
        backgroundColor: "white",
        fontWeight: "bold",
        fontSize: normalize(6),
    }
});