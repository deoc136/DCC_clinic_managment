import axios from "axios";

export async function sendWhatsAppMessage(
    names: string,
    textDate: string,
    hour: string,
    locationAndTherapist: string,
    clinicName: string,
    phoneNumber: string,
 ) {
    return await axios.post(
       `https://graph.facebook.com/v18.0/236143679572746/messages`,
       {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
             name: 'recordatorio',
             language: {
                code: 'es',
             },
             components: [
                {
                   type: 'body',
                   parameters: [
                      {
                         type: 'text',
                         text: names,
                      },
                      {
                         type: 'text',
                         text: textDate,
                      },
                      {
                         type: 'text',
                         text: hour,
                      },
                      {
                         type: 'text',
                         text: locationAndTherapist,
                      },
                      {
                         type: 'text',
                         text: clinicName,
                      },
                   ],
                },
             ],
          },
       },
       {
          headers: {
             authorization: `Bearer ${process.env.WHATSAPP_KEY}`,
             'Content-Type': 'application/json',
          },
       },
    ).catch((e) => {
      console.log(e)
    });
 }