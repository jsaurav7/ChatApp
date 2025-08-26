import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                if (Platform.OS === "web") {
                    window.alert("Login successful");
                } else {
                    Alert.alert("Success", "Login successful");
                }

                const data = await response.json();
                await AsyncStorage.setItem("authToken", data.token);
                await AsyncStorage.setItem("user", JSON.stringify(data.user));

                router.replace("/contacts");
            } else {
                const error = await response.text();
                if (Platform.OS === "web") {
                    window.alert("Login failed: " + error);
                } else {
                    Alert.alert("Error", "Login failed: " + error);
                }
            }
        } catch (error) {
            if (Platform.OS === "web") {
                window.alert("Error: " + error.message);
            } else {
                Alert.alert("Error", error.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <View style={{ gap: 12 }}>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace("/register")}>
                    <Text style={styles.outlineButtonText}>Register</Text>
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
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
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
