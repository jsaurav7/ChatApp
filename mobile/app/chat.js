import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Animated,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams();
    const navigation = useNavigation();

    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello!', sender: 'other', time: '09:00 AM' },
        { id: '2', text: 'Hi! How are you?', sender: 'me', time: '09:01 AM' },
    ]);

    const [inputText, setInputText] = useState('');
    const [online, setOnline] = useState(true);
    const flatListRef = useRef();
    const animatedDot = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedDot, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(animatedDot, { toValue: 0, duration: 600, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: '#1c1c1c' },
            headerTitle: () => (
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
                    {online && (
                        <Animated.View
                            style={[
                                styles.onlineDot,
                                {
                                    opacity: animatedDot.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.4, 1],
                                    }),
                                },
                            ]}
                        />
                    )}
                </View>
            ),
            headerTintColor: '#fff',
        });
    }, [name, online]);

    const sendMessage = () => {
        if (inputText.trim() === '') return;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            time: timeString,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }) => {
        const isMe = item.sender === 'me';
        return (
            <View
                style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.otherMessage,
                ]}
            >
                <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>
                    {item.text}
                </Text>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    messageList: { padding: 10, paddingBottom: 20 },
    messageBubble: {
        padding: 12,
        marginVertical: 6,
        maxWidth: '75%',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4CAF50',
        borderTopRightRadius: 0,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderTopLeftRadius: 0,
        borderWidth: 0.5,
        borderColor: '#eee',
    },
    myMessageText: { color: '#fff', fontSize: 15 },
    otherMessageText: { color: '#000', fontSize: 15 },
    timeText: {
        fontSize: 12,
        color: '#04072cff',
        alignSelf: 'flex-end',
        marginTop: 7,
        marginStart: 5
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        padding: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        backgroundColor: '#f5f5f5',
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: { color: '#fff', fontWeight: 'bold' },
    headerContainer: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#fff', // changed to white
    },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
    },
});
