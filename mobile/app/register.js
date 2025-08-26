import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { router } from "expo-router";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        if (!name || !email || !password) {
            if (Platform.OS === "web") {
                window.alert("Error: Please fill all fields");
            } else {
                Alert.alert("Error", "Please fill all fields");
            }
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (Platform.OS === "web") {
                    window.alert("Success: User registered successfully");
                } else {
                    Alert.alert("Success", "User registered successfully");
                }

                router.replace("/login");
            } else {
                if (Platform.OS === "web") {
                    window.alert("Error: " + (data.message || "Registration failed"));
                } else {
                    Alert.alert("Error", data.message || "Registration failed");
                }
            }
        } catch (error) {
            console.error(error);
            if (Platform.OS === "web") {
                window.alert("Error: " + error.message);
            } else {
                Alert.alert("Error", "Something went wrong");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>

            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <View style={{ gap: 12 }}>
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton} onPress={() => { router.replace("/login") }}>
                    <Text style={styles.outlineButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
    },
    outlineButton: {
        backgroundColor: "transparent",
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#007bff",
        alignItems: "center",
    },
    outlineButtonText: {
        color: "#007bff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

