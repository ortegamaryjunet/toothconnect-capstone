import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8'
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 24
    },

    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#1a365d',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 32
    },

    label: {
        fontSize: 12,
        color: '#4a5568',
        marginBottom: 4,
        marginTop: 8
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 8
    },

    error: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: 10,
        borderRadius: 6,
        fontSize: 13,
        marginTop: 8,
        marginBottom: 8
    },

    button: {
        backgroundColor: '#3182ce',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },

    link: {
        marginTop: 16,
        alignItems: 'center'
    },
    linkText: {
        color: '#3182ce',
        fontSize: 14
    }
});

export default styles;