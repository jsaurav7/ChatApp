import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ContactsScreen() {
    const [contacts, setContacts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [email, setEmail] = useState("");

    const handleAddContact = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter an email.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("authToken");

            const response = await fetch("http://localhost:3000/contacts/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Contact added successfully!");
                setEmail("");
                setModalVisible(false);

                fetchContacts()
            } else {
                Alert.alert("Error", data.message || "Failed to add contact.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong. Try again.");
        }
    };

    const handlePress = (user) => {
        router.push({
            pathname: '/chat',
            params: { id: user.id, name: user.name },
        });
    };

    const fetchContacts = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                return;
            }

            const response = await fetch("http://localhost:3000/contacts/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setContacts(data);
            } else {
                Alert.alert("Error", data.message || "Failed to load contacts");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong");
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const renderItem = ({ item }) => {
        const formattedTime = item.last_seen
            ? new Date(item.last_seen).toLocaleString()
            : "N/A";

        return (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.time}>Last seen: {formattedTime}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Add Contact</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add Contact</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                                onPress={handleAddContact}
                            >
                                <Text style={{ color: "#fff" }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    card: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
    name: { fontSize: 18, fontWeight: "bold" },
    email: { fontSize: 14, color: "gray" },
    time: { fontSize: 12, color: "#888" },
    addButton: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    addButtonText: { color: "#fff", fontWeight: "bold" },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 15,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        padding: 10,
        borderRadius: 6,
        width: "45%",
        alignItems: "center",
    },
});
