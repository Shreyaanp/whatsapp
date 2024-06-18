const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT, SUPPORT_AVAILABILITY, BUSINESS_PHONE_NUMBER_ID } = process.env;

const userState = new Map();

const isSupportAvailable = () => {
  return SUPPORT_AVAILABILITY === "true";
};

const sendMessageToUser = async (to, message) => {
  const url = `https://graph.facebook.com/v18.0/${BUSINESS_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: message }
  };

  try {
    const response = await axios({
      method: "POST",
      url: url,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: data,
    });

    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Error sending message:", error.response ? error.response.data : error.message);
  }
};

const sendInteractiveMessage = async (to, message) => {
  const url = `https://graph.facebook.com/v18.0/${BUSINESS_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "interactive",
    interactive: message.interactive
  };

  try {
    const response = await axios({
      method: "POST",
      url: url,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: data,
    });

    console.log("Interactive message sent:", response.data);
  } catch (error) {
    console.error("Error sending interactive message:", error.response ? error.response.data : error.message);
  }
};

const handleIncomingMessage = async (from, messageText, messageId, businessPhoneNumberId, userName) => {
  let responseMessage;
  let responseType = 'text'; // Default response type

  const backButtonMessage = {
    interactive: {
      type: 'button',
      body: {
        text: 'Would you like to go back to the main menu?'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'back_to_main',
              title: 'Back to Main Menu'
            }
          }
        ]
      }
    }
  };

  if (!userState.has(from)) {
    userState.set(from, { context: 'main_menu' });
  }

  const userContext = userState.get(from);

  switch (userContext.context) {
    case 'main_menu':
      switch (messageText.toLowerCase()) {
        case 'hi':
        case 'hello':
          responseMessage = {
            interactive: {
              type: 'button',
              body: {
                text: `Hi ${userName}, welcome to 3i Consulting! How can I help you today?\n\nIf you want to directly chat with our team or sales team, message "continue".`
              },
              action: {
                buttons: [
                  {
                    type: 'reply',
                    reply: {
                      id: 'about_3i',
                      title: 'About 3i'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'services',
                      title: 'Services'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'products',
                      title: 'Products'
                    }
                  }
                ]
              }
            }
          };
          responseType = 'interactive';
          break;
        case 'about_3i':
          responseMessage = {
            text: '3i Consulting is comprised of a group of experienced and professional consultants who drive the vision of establishing Business Excellence with ERP, BI, Support and Maintenance services. We kick-started operations in India with an insight for futuristic development and to strengthen our services catered to customers. From accelerating growth in mobile technology to IT Support, 3i consulting is the one-stop-shop for all your business needs. For more information, visit our website: https://3iconsulting.in'
          };
          await sendMessageToUser(from, responseMessage.text);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await sendInteractiveMessage(from, backButtonMessage);
          return;
        case 'services':
          responseMessage = {
            text: 'We are a competent consultancy catering to Application Development needs and quality SAP Services. Full-fledged analysis of your business competitors, effective solutions to improve your branding; all this and much more only with 3i Consulting! Accelerate, optimize and improve your operating efficiency with our cutting-edge deployable services. Our services include:\n1. Tech Consulting\n2. Application Development\n3. Digital Media Management\n4. Cloud Solutions\n5. Digital Security\n6. Helpdesk Support\n7. Server Deployment\n\nPlease enter the number of the service you are interested in to know more.'
          };
          await sendMessageToUser(from, responseMessage.text);
          userContext.context = 'services';
          return;
        case 'products':
          responseMessage = {
            text: 'Our products include a variety of systems tailored to meet your needs. Here is a list of our products:\n1. Temple Management System\n2. Human Resources Management System (HRMS)\n3. Project Management System\n4. OPD Booking System\n5. Lab Report Monitoring\n6. Learning Management System\n7. Inventory Management System\n8. Legal Management System\n9. Property Management System\n10. Tourism Management System\n11. E-Dak Management System\n12. Visitor & Complaint Management System\n13. Beneficiary Management System\n14. E-Pass Portal\n15. ID Card Management System\n16. Character Certificate System\n\nPlease enter the number of the product you are interested in to know more.'
          };
          await sendMessageToUser(from, responseMessage.text);
          userContext.context = 'products';
          return;
        case 'continue':
          if (isSupportAvailable()) {
            responseMessage = {
              text: 'Let\'s check if any of our support persons are available...'
            };
            await sendMessageToUser(from, responseMessage.text);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sendMessageToUser(from, 'Our team is currently unavailable. We will get back to you as soon as possible.');
            return;
          } else {
            responseMessage = {
              text: 'Our team is currently unavailable. We will get back to you as soon as possible.'
            };
          }
          break;
        default:
          responseMessage = { text: `You said: ${messageText}` };
          responseType = 'text';
          break;
      }
      break;
    case 'services':
      switch (messageText) {
        case '1':
          responseMessage = {
            text: 'Tech Consulting: Our Tech Consulting offer comprehensive, end-to-end solutions tailored to meet the unique needs of businesses and organizations across various industries. We specialize in designing and implementing robust technology architectures that ensure scalability, security, and efficiency. From initial planning to deployment and maintenance, our expert consultants provide strategic guidance and technical expertise to drive your digital transformation and achieve your business goals.'
          };
          break;
        case '2':
          responseMessage = {
            text: 'Full Stack Tech Solution: We provide complete end-to-end solutions consisting of website, Android and iOS apps, and a dashboard from where clients and government divisions can handle their operations easily, like tracking customers, sending push notifications, and making other real-time changes.'
          };
          break;
        case '3':
          responseMessage = {
            text: 'Digital Media Management: We maintain and manage every type of social media handle, like Twitter, Instagram, Facebook Page, YouTube channels, etc.'
          };
          break;
        case '4':
          responseMessage = {
            text: 'Cloud Solutions: We offer comprehensive cloud solutions to help you optimize your IT infrastructure. Our offerings include IaaS, PaaS, SaaS, Cloud Security, Hybrid Cloud, Cloud Storage, Cloud Migration, Serverless Computing, Cloud-native Architecture, Cloud Governance, Cloud Monitoring and Management, and working with various Cloud Service Providers.'
          };
          break;
        case '5':
          responseMessage = {
            text: 'Digital Security: Protect your business with our cutting-edge digital security solutions.'
          };
          break;
        case '6':
          responseMessage = {
            text: 'Helpdesk & Support: Our Help Desk and Support Service provide reliable, responsive, and comprehensive assistance to ensure the smooth operation of your business\'s IT infrastructure. With a focus on resolving issues quickly and effectively, our team of skilled professionals offers round-the-clock support to address any technical challenges you may encounter.'
          };
          break;
        case '7':
          responseMessage = {
            text: 'Server Deployment: We provide reliable server deployment services to ensure your business runs smoothly. We work with AWS, Azure, GCP, and other platforms.'
          };
          break;
        case 'back_to_main':
          userContext.context = 'main_menu';
          responseMessage = {
            interactive: {
              type: 'button',
              body: {
                text: `Hi ${userName}, welcome to 3i Consulting! How can I help you today?\n\nIf you want to directly chat with our team or sales team, message "continue".`
              },
              action: {
                buttons: [
                  {
                    type: 'reply',
                    reply: {
                      id: 'about_3i',
                      title: 'About 3i'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'services',
                      title: 'Services'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'products',
                      title: 'Products'
                    }
                  }
                ]
              }
            }
          };
          responseType = 'interactive';
          await sendInteractiveMessage(from, responseMessage);
          return;
        default:
          responseMessage = { text: 'Please enter a valid option.' };
          break;
      }
      await sendMessageToUser(from, responseMessage.text);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendInteractiveMessage(from, backButtonMessage);
      return;
    case 'products':
      switch (messageText) {
        case '1':
          responseMessage = {
            text: 'Temple Management System: A comprehensive system for managing all aspects of temple operations including devotee management, protocol management, and prasadam distribution.\nServices:\n1. Kashi Prasadam\n2. Protocol System\n3. Devotee Support System'
          };
          userContext.context = 'temple_management_system';
          break;
        // Add similar cases for other products
        case 'back_to_main':
          userContext.context = 'main_menu';
          responseMessage = {
            interactive: {
              type: 'button',
              body: {
                text: `Hi ${userName}, welcome to 3i Consulting! How can I help you today?\n\nIf you want to directly chat with our team or sales team, message "continue".`
              },
              action: {
                buttons: [
                  {
                    type: 'reply',
                    reply: {
                      id: 'about_3i',
                      title: 'About 3i'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'services',
                      title: 'Services'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'products',
                      title: 'Products'
                    }
                  }
                ]
              }
            }
          };
          responseType = 'interactive';
          await sendInteractiveMessage(from, responseMessage);
          return;
        default:
          responseMessage = { text: 'Please enter a valid option.' };
          break;
      }
      await sendMessageToUser(from, responseMessage.text);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendInteractiveMessage(from, backButtonMessage);
      return;
    case 'temple_management_system':
      switch (messageText) {
        case '1':
          responseMessage = {
            text: 'Kashi Prasadam: Details and link here.'
          };
          break;
        case '2':
          responseMessage = {
            text: 'Protocol System: Details and link here.'
          };
          break;
        case '3':
          responseMessage = {
            text: 'Devotee Support System: Details and link here.'
          };
          break;
        case 'back_to_main':
          userContext.context = 'main_menu';
          responseMessage = {
            interactive: {
              type: 'button',
              body: {
                text: `Hi ${userName}, welcome to 3i Consulting! How can I help you today?\n\nIf you want to directly chat with our team or sales team, message "continue".`
              },
              action: {
                buttons: [
                  {
                    type: 'reply',
                    reply: {
                      id: 'about_3i',
                      title: 'About 3i'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'services',
                      title: 'Services'
                    }
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'products',
                      title: 'Products'
                    }
                  }
                ]
              }
            }
          };
          responseType = 'interactive';
          await sendInteractiveMessage(from, responseMessage);
          return;
        case 'back_to_last':
          userContext.context = 'products';
          responseMessage = {
            text: 'Our products include a variety of systems tailored to meet your needs. Here is a list of our products:\n1. Temple Management System\n2. Human Resources Management System (HRMS)\n3. Project Management System\n4. OPD Booking System\n5. Lab Report Monitoring\n6. Learning Management System\n7. Inventory Management System\n8. Legal Management System\n9. Property Management System\n10. Tourism Management System\n11. E-Dak Management System\n12. Visitor & Complaint Management System\n13. Beneficiary Management System\n14. E-Pass Portal\n15. ID Card Management System\n16. Character Certificate System\n\nPlease enter the number of the product you are interested in to know more.'
          };
          await sendMessageToUser(from, responseMessage.text);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await sendInteractiveMessage(from, backButtonMessage);
          return;
        default:
          responseMessage = { text: 'Please enter a valid option.' };
          break;
      }
      await sendMessageToUser(from, responseMessage.text);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendInteractiveMessage(from, backButtonMessage);
      return;
    // Add similar cases for other contexts
    default:
      responseMessage = { text: 'Please enter a valid option.' };
      break;
  }

  await sendMessage(from, responseMessage, messageId, businessPhoneNumberId, responseType);
};

const sendMessage = async (to, message, messageId, businessPhoneNumberId, responseType) => {
  const url = `https://graph.facebook.com/v18.0/${businessPhoneNumberId}/messages`;
  let data;

  if (responseType === 'interactive') {
    data = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "interactive",
      interactive: message.interactive
    };
  } else {
    data = {
      messaging_product: "whatsapp",
      to: to,
      text: { body: message.text },
      context: {
        message_id: messageId // shows the message as a reply to the original user message
      }
    };
  }

  try {
    const response = await axios({
      method: "POST",
      url: url,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: data,
    });

    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Error sending message:", error.response ? error.response.data : error.message);
  }
};

app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const interactiveReply = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0]?.interactive?.button_reply?.id;
  const userName = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0]?.profile?.name || "there";

  if (message) {
    if (message.type === "text") {
      const business_phone_number_id = req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
      await handleIncomingMessage(message.from, message.text.body, message.id, business_phone_number_id, userName);
    } else if (interactiveReply) {
      const business_phone_number_id = req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
      await handleIncomingMessage(message.from, interactiveReply, message.id, business_phone_number_id, userName);
    }
  }

  res.sendStatus(200);
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
