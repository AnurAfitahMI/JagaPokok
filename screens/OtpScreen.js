import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';

const OtpScreen = ({ navigation, route }) => {
  const { phone = '+60XXXXXXXXX', username = '' } = route.params || {}; // receives data from LoginScreen
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);

  // Countdown timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handles OTP input change
  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input automatically
    if (text && index < 5) {
      const nextInput = `otp${index + 1}`;
      refs[nextInput]?.focus();
    }
  };

  const refs = {};

  const handleSubmit = () => {
  console.log('Bypassing OTP for testing...');
  navigation.navigate('Home', { username }); // Directly go to HomeScreen
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <Text style={styles.subtitle}>
        Please enter the OTP code sent to
      </Text>
      <Text style={styles.phoneNumber}>{phone}</Text>

      {/* OTP Input Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (refs[`otp${index}`] = ref)}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      {/* Countdown + Resend */}
      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={styles.timerText}>{timer}s</Text>
        ) : (
          <TouchableOpacity onPress={() => setTimer(60)}>
            <Text style={styles.resendText}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Illustration */}
      <Image
        
        style={styles.image}
        resizeMode="contain"
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9E4CA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005C3A',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#004B3A',
    marginBottom: 5,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005C3A',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#39A96B',
    borderRadius: 10,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 20,
    color: '#004B3A',
    marginHorizontal: 5,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    color: '#005C3A',
    fontSize: 14,
  },
  resendText: {
    color: '#39A96B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  image: {
    width: 120,
    height: 160,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#39A96B',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OtpScreen;
