import { Alert, Button, Code, CopyButton, FocusTrap, Group, Loader, Modal, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconCopy, IconExclamationCircle, IconSchool } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
export default function CreateClass() {

    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const [code, setCode] = useState('');

    const form = useForm({
        initialValues: {
            name: '',
            courseCode: '',
            description: '',
            endDate: date,
        },
    });


    const setFormDate = (date: DateValue) => {
        form.setFieldValue('endDate', date);
        setDate(date);
    }

    const createClass = async (values: any) => {
        setLoading(true);
        try {
            const res = await axios.post(serverUrl + '/class/create', values, { withCredentials: true });
            setCode(res.data.code);
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
        <div>
            <Modal opened={opened} onClose={close} title="Focus demo">
                <FocusTrap.InitialFocus />
                {errorMessage && (
                    <Alert variant="light" title="Error" color="red" icon={<IconExclamationCircle />}>
                        {errorMessage}
                    </Alert>
                )}
                {/* if loading is true, display a loader, else if error, nothing, else code and copy button */}
                {loading ? <Loader size={24} /> : errorMessage ? null : <Group>
                    <Code
                        style={{
                            fontSize: '1.5rem',
                            padding: '1rem',
                            letterSpacing: '0.2rem',
                            fontFamily: 'monospace'
                        }}
                    >
                        {code}
                    </Code>
                    <CopyButton value={code}>
                        {({ copied, copy }) => (
                            <Button
                                color={copied ? 'teal' : 'blue'}
                                onClick={copy}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </CopyButton>
                </Group>}
                <Button component="a" href='/' fullWidth size="md" variant="filled" color="#357c99" disabled={!!errorMessage} leftSection={<IconCopy className='size-5' />}>{loading ? <Loader size={24} /> : "Continue"}</Button>
            </Modal>
            <form className="w-full text-left py-4" onSubmit={form.onSubmit((values) => createClass(values))}>
                <Stack >


                    <TextInput
                        required
                        size="md"
                        mt="md"
                        value={form.values.name}
                        onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email entered'}
                        rightSectionPointerEvents="none"
                        rightSection={<IconSchool className="size-5" />}
                        label="School Email"
                        placeholder="Your email"

                    />
                    <TextInput
                        required
                        size="md"
                        value={form.values.courseCode}
                        onChange={(event) => form.setFieldValue('courseCode', event.currentTarget.value)}
                        label="Your Name"
                        description="This field is auto-filled based on your email."
                        placeholder="Your name"
                    />
                    <Textarea
                        size='md'
                        value={form.values.description}
                        onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
                        label="Input label"
                        description="Input description"
                        placeholder="Input placeholder"
                    />
                    <DateInput
                        value={date}
                        onChange={setFormDate}
                        label="Date input"
                        placeholder="Date input"
                    />


                    <Button onClick={open} type="submit" fullWidth size="md" variant="filled" color="#357c99">{loading ? <Loader size={24} /> : "Sign in"}</Button>

                </Stack>

            </form>
        </div>
    )
}