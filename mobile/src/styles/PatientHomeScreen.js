import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8'
    },

    header: {
        backgroundColor: '#1a365d',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    logout: {
        color: '#fff',
        fontSize: 14
    },

    body: {
        flex: 1,
        padding: 20
    },
    welcome: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1a365d'
    },
    email: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 20
    },

    placeholder: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    placeholderTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d3748'
    },
    placeholderText: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4
    }
});

export default styles;