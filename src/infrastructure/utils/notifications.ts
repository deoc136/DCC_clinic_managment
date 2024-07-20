import { sendEmailData } from "../entry-points/general/email_controller";
import { sendSMS } from "../entry-points/general/sms_controller";
import { cutFullName } from "./utils";
import { sendWhatsAppMessage } from "./whatsapp";

export async function sendMessages(
    clinic: any,
    date: Date,
    patient: any,
    headquarter: any,
    therapist: any,
    code: string,
    hour: string,
 ) {
    const names = cutFullName(patient.names, patient.last_names);
    const textDate = `${date.getDate()} de ${Intl.DateTimeFormat('es', {
       month: 'long',
    }).format(date)} de ${date.getFullYear()}`;
    const locationAndTherapist = `${headquarter.name} / ${cutFullName(
       therapist.names,
       therapist.last_names,
    )} `;
    const clinicName = clinic.name;
    const messageTemplate = `
 ¡Hola ${names}! Este es un recordatorio amistoso sobre tu cita médica de mañana. 
 
 Fecha: ${textDate}
   
 Hora: ${hour}
   
 Ubicación: ${locationAndTherapist}
   
 Si necesitas ayuda o quieres reprogramar, llámanos. ¡Nos vemos pronto! ${clinicName} `;
    await Promise.all([
       await sendSMS(
          messageTemplate,
          `${code} ${patient.phone}`,
       ),
       await sendWhatsAppMessage(
          names,
          textDate,
          hour,
          locationAndTherapist,
          clinicName,
          `${code}${patient.phone}`,
       ),
    ]);
 }
 
 export async function sendMail(
    clinic: any,
    date: Date,
    patient: any,
    headquarter: any,
    therapist: any,
    hour: string,
 ) {
    await sendEmailData(
       'agenda.ahora.dvp@gmail.com',
       [patient.email],
       `Recordatorio de tu cita médica programada para mañana - ${clinic.name}`,
       `<meta content=\"text/html; charset=UTF-8\" http-equiv=\"Content-Type\"/><head></head><body><div style=\"min-height:100vh;width:100%;max-width:640px;background-color:rgb(242,242,250);padding:1.5rem\"><img src=\"${
          clinic.profile_picture_url
       }\" style=\"display:block;outline:none;border:none;text-decoration:none;box-sizing:content-box;width:9rem;padding-left:3rem;padding-right:3rem;padding-top:1.5rem;padding-bottom:1.5rem\"/><section class=\"font-[-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif]\" style=\"border-radius:0.5rem;background-color:rgb(255,255,255);padding:2.75rem\"><div style=\"margin-bottom:1.5rem;font-size:1rem;line-height:1.5rem;color:rgb(96,96,97)\">
       <p>
          Hola ${cutFullName(patient.names, patient.last_names)}, <br /><br />
          Esperamos que este mensaje te encuentre bien. Queremos recordarte sobre tu cita médica programada para mañana. Aquí están los detalles:
          <br /><br />
          <br /><br />
          Fecha: ${date.getDate()} de ${Intl.DateTimeFormat('es', {
             month: 'long',
          }).format(date)} de ${date.getFullYear()}
          <br /><br />
          <br /><br />
          Hora: ${hour}
          <br /><br />
          <br /><br />
          Ubicación: ${headquarter.name} / ${cutFullName(
             therapist.names,
             therapist.last_names,
          )}
          <br /><br />
          <br /><br />
          Si tienes alguna pregunta o necesitas reprogramar la cita, por
          favor comunícate con nosotros lo antes posible.
          <br /><br />
          ¡Esperamos verte mañana!
          <br /><br />
          ${clinic.name}
       </p>
 
       </div><p style=\"margin-top:0.5rem;font-size:0.75rem;line-height:1rem\">© 2024 Agenda ahora</p></section></div></body>`,
    )
 }
 