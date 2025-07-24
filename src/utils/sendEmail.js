import { Resend } from 'resend';

const resend = new Resend('re_2vmETNme_4v3f1EhKkUHY87MZ8NayDGsz');

export const sendEmail = async () => {
    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['emorales.adma@gmail.com'],
        subject: 'Your Shopping List',
    });

    if (error) {
        return console.error({ error });
    }
}
