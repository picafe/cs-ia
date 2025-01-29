import { Button, Group, TextInput } from '@mantine/core';
import { useField } from '@mantine/form';
import axios from 'axios';
import { useState } from 'react';

export default function JoinClass() {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const code = useField({
        initialValue: '',
        validate: (value) => (value.trim().length < 2 ? 'Value is too short' : null),
      });
      const joinClass = async() => {
        setLoading(true);
        try {
            const res = await axios.post(serverUrl + '/class/join', code, { withCredentials: true });
        }
        catch (err) {
            let errorMessage: string;
            if (axios.isAxiosError(err) && err.response)
                errorMessage = err.response.data;
            else
                errorMessage = "Something unexpected happened! Please contact support.";
            setErrorMessage('Login failed: ' + errorMessage);
        }
        finally {
            setLoading(false);
        }
      }
    return (
        <div className="h-[600px] flex items-center justify-center">
            <div className="px-64 flex flex-col gap-12 min-h-full w-full items-center justify-center">
                <h1>Join a Class</h1>

                    <TextInput
                        {...code.getInputProps()}
                        withAsterisk
                        label="Course Code"
                        size='lg'
                        placeholder="abc123"
                    />
                    <Group justify="flex-end" mt="md">
                        <Button onClick={() => joinClass()}>Submit</Button>
                    </Group>

            </div>
        </div>
    )
}