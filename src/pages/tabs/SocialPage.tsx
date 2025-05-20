import React, { useState } from "react";
import {
    IonPage,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonIcon,
} from "@ionic/react";
import { people, peopleCircle, mailOpen, mailUnread } from "ionicons/icons";
import Friends from "./socialPages/Friends";
import Groups from "./socialPages/Groups";
import RequestsSent from "./socialPages/Requests-sent";
import RequestsReceived from "./socialPages/Requests-received";

const SocialPage: React.FC = () => {
    const [tab, setTab] = useState("friends");

    return (
        <IonPage>
            <IonContent>
                <IonSegment
                    value={tab}
                    onIonChange={(e) => setTab(e.detail.value!)}
                >
                    <IonSegmentButton value="friends">
                        <IonIcon icon={people} />
                    </IonSegmentButton>
                    <IonSegmentButton value="groups">
                        <IonIcon icon={peopleCircle} />
                    </IonSegmentButton>
                    <IonSegmentButton value="requests-sent">
                        <IonIcon icon={mailOpen} />
                    </IonSegmentButton>
                    <IonSegmentButton value="requests-received">
                        <IonIcon icon={mailUnread} />
                    </IonSegmentButton>
                </IonSegment>
                {tab === "friends" && <Friends />}
                {tab === "groups" && <Groups />}
                {tab === "requests-sent" && <RequestsSent />}
                {tab === "requests-received" && <RequestsReceived />}
            </IonContent>
        </IonPage>
    );
};

export default SocialPage;
