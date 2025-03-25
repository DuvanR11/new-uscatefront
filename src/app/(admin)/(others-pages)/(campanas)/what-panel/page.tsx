"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import FileInput from "@/components/form/input/FileInput";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";


// import { Metadata } from "next";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

// export const metadata: Metadata = {
//   title:
//     "Uscategui Panel",
//   description: "Gestiona, organiza y parametriza actividades",
// };

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function WhatPanelPage() {
    const [messageTwo, setMessageTwo] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          console.log("Selected file:", file.name);
        }
    };

    const options = [
      { value: "marketing", label: "Marketing" },
      { value: "template", label: "Template" },
      { value: "development", label: "Development" },
    ];
      
    const handleSelectChange = (value: string) => {
      console.log("Selected value:", value);
    };

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [totalMessagesSent, setTotalMessagesSent] = useState<number | null>(null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [eventList, setEventList] = useState<string[]>([]);
    const [selectedEventName, setSelectedEventName] = useState<string | null>(null); // nuevo estado
  
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors: errorsGeneral }
    } = useForm<FieldValues>({ defaultValues: {} });
  
    const setCustomValue = (id: any, value: any) => {
      setValue(id, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    };
  
    const urlMedia = watch('urlMedia');
  
    const onSubmitGenreal = async (formData: any) => {
      try {
        setLoading(true);
        setIsBroadcasting(true);
  
        if (!formData.csvFile || formData.csvFile.length === 0) {
          // toast.error('❌ Por favor, sube un archivo CSV.');
          setIsBroadcasting(false);
          setLoading(false);
          return;
        }
  
        const formDataToSend = new FormData();
        formDataToSend.append('csvFile', formData.csvFile[0]);
        if (formData.urlMedia) {
          formDataToSend.append('urlMedia', formData.urlMedia);
        }
        formDataToSend.append('message', formData.message);
  
        await axios.post(`${apiWhatsApp}/upload`, formDataToSend);
        // toast.success('Envio de mensajes exitoso');
  
        router.refresh();
        reset(); // esto limpia el form pero ya no afecta el evento seleccionado
        setIsBroadcasting(false);
      } catch (error: any) {
        // toast.error('¡Oops! Algo salió mal.');
      } finally {
        setLoading(false);
      }
    };
  
    const cancelBroadcast = async () => {
      try {
        const response = await axios.post(`${apiWhatsApp}/cancel-broadcast`);
        console.log(response.data);
        alert('Difusión cancelada');
      } catch (error) {
        console.error('Error al cancelar la difusión:', error);
      }
    };
  
    useEffect(() => {
      if (!isBroadcasting) return;
  
      const fetchTotalMessagesSent = async () => {
        try {
          const response = await axios.get(`${apiWhatsApp}/v1/total-messages-sent`);
          setTotalMessagesSent(response.data.totalMessagesSent + 1);
        } catch (error) {
          console.error('Error al obtener el total de mensajes enviados:', error);
        }
      };
  
      fetchTotalMessagesSent();
      const interval = setInterval(fetchTotalMessagesSent, 5000);
      return () => clearInterval(interval);
    }, [isBroadcasting]);
  
    // Nuevo useEffect para guardar estadísticas al finalizar difusión
    useEffect(() => {
      if (!isBroadcasting && selectedEventName && totalMessagesSent !== null) {
        saveEventStats(selectedEventName, totalMessagesSent);
        setTotalMessagesSent(null); // Evita duplicación
      }
    }, [isBroadcasting, totalMessagesSent]);
  
    const createMessageEvent = async () => {
      if (!newEventName.trim()) {
        // toast.error("Por favor escribe un nombre para el evento.");
        return;
      }
  
      try {
        const response = await axios.post(`${authUrl}/api/messages/create`, {
          eventName: newEventName,
        });
  
        const createdEvent = response.data.eventName;
        // toast.success("✅ Evento creado exitosamente");
  
        setEventList(prev => [...prev, createdEvent]);
        setNewEventName('');
      } catch (error) {
        console.error("Error al crear el evento:", error);
        // toast.error("Error al crear el evento");
      }
    };
  
    const saveEventStats = async (eventName: string, total: number) => {
      try {
        await axios.post(`${authUrl}/api/message-stats/all`, {
          eventName,
          totalMessagesSent: total
        });
        // toast.success("📊 Estadísticas guardadas correctamente");
      } catch (error) {
        console.error("Error al guardar estadísticas:", error);
        // toast.error("❌ No se pudieron guardar las estadísticas del evento");
      }
    };
  
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${authUrl}/api/messages/events`);
        const eventsFromDb = response.data.map((e: any) => e.eventName);
        setEventList(eventsFromDb);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
        // toast.error("❌ No se pudieron cargar los eventos");
      }
    };
  
    useEffect(() => {
      fetchEvents();
    }, []);
  
  
  return (
    <div>
      <PageBreadcrumb pageTitle="WhatsApp Panel" />
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Personaliza tu difusión
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Bienvenido al panel de difusión masiva en el cual podras realizar campañas por medio de WhatsApp
          </p>
        </div>
        <div>
          <form  encType="multipart/form-data">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <div>
                  <Label>Redacta tu mensaje</Label>
                  <TextArea
                    rows={14}
                    {...register('message')}
                    value={messageTwo}
                    // error
                    onChange={(value) => setMessageTwo(value)}
                    // hint="Redacta el mensaje ideal para tu difusion"
                  />
                </div>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <Label>Adjunta tu archivo multimedia</Label>
                <ImageUpload
                  onChange={(value) => setCustomValue('urlMedia', value)}
                  value={urlMedia || undefined}
                />
              </div>

              <div className="col-span-6 sm:col-span-3 space-y-2">
                <Label>Selecciona tu evento</Label>
                <div className="relative">
                  <Select
                    options={options}
                    placeholder="Select Option"
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon/>
                    </span>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <Label>Adjunta tu listado de difusión</Label>
                <FileInput onChange={handleFileChange} className="custom-class" />
              </div>

              <div className="col-span-6 sm:col-full flex flex-col space-y-6">
                <div className="flex space-x-4">
                  <Button  size="sm" variant="primary" type="submit"> 
                    Enviar Difusión
                  </Button>
                  <Button  size="sm" variant="primary" type="submit" onClick={cancelBroadcast}>   
                    Cancelar Difusión
                  </Button>
                </div>
                {/* 
                {totalMessagesSent !== undefined && (
                  <div className="bg-cyan-600 text-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
                    <p className="text-lg font-semibold">
                      Total de mensajes enviados: <strong>{totalMessagesSent}</strong>
                    </p>
                  </div>
                )} */}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
