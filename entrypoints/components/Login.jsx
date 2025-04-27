import {Anchor, Button, Container, Group, Paper, TextInput, Title,} from '@mantine/core';
import {useValidatedState} from '@mantine/hooks';
import BaseUtils from 'validator/es';
import {toast} from 'react-toastify';

export function Login() {
  const isValidCode = (code) => {
    return !BaseUtils.isEmpty(code) && code.length >= 4;
  }

  const [email, setEmail] = useValidatedState(
    '',
    (val) => BaseUtils.isEmail(val),
    true
  );
  const [code, setCode] = useValidatedState(
    '',
    (val) => isValidCode(val),
    true
  );

  const sendCode = () => {
    if (!BaseUtils.isEmail(email.value)) {
      toast.error('Email is not valid');
      return;
    }
    browser.runtime.sendMessage({action: VERIFY_EMAIL, email: email.value}).then(response => {
      if (!response.done) {
        toast.error('Sending code failed. Please try again later');
      } else {
        toast.success('Verification code is sent to your email.');
      }
      return true;
    });
  }

  const login = () => {
    if (!BaseUtils.isEmail(email.value) || !isValidCode(code.value)) {
      toast.error('Email or code is not valid');
      return;
    }
    browser.runtime.sendMessage({
      action: LOGIN, user: {
        email: email.value, token: code.value
      }
    }).then(response => {
      if (!response.done) {
        toast.error('SignIn failed. Please try again later');
      }
      return true;
    });
  }
  return (
    <Container w={380}>
      <Title ta="center" fw={900} mt="md" mb={10} style={{
        fontFamily: 'Greycliff CF, var(--mantine-font-family)'
      }}>
        Join Shark Eagle Note
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Email" placeholder="you@example.com" required
                   description="We'll never share your email with anyone else."
                   inputWrapperOrder={['label', 'error', 'input', 'description']}
                   value={email.value}
                   withAsterisk
                   error={!email.valid}
                   onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <TextInput label="Verification Code" placeholder="Click link below to receive the code"
                   required mt="md"
                   value={code.value}
                   withAsterisk
                   error={!code.valid}
                   onChange={(event) => setCode(event.currentTarget.value)}/>
        <Group justify="space-between" mt="lg">
          <Anchor component="button" size="sm" onClick={sendCode}>
            * Send verification code to email
          </Anchor>
        </Group>
        <Button fullWidth mt="xl" onClick={login} disabled={!isValidCode(code.value)}>
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
