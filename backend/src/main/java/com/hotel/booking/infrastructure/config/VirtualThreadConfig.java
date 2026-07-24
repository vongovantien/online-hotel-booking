package com.hotel.booking.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;

import java.util.concurrent.Executors;

/**
 * Enables Java 21 Virtual Threads (Project Loom) for Spring's async task executor.
 *
 * Combined with server.tomcat.threads.virtual.enabled=true in application.yml,
 * every HTTP request and every @Async task runs on a virtual thread instead of
 * a platform thread. Virtual threads are cheap (< 1KB stack vs ~1MB for platform
 * threads) and park instead of block — ideal for the I/O-heavy workload of this
 * service (DB queries, Redis calls).
 *
 * No code changes are needed in the business logic — Spring wires this executor
 * automatically when spring.threads.virtual.enabled=true is set.
 */
@Configuration
public class VirtualThreadConfig {

    @Bean
    public AsyncTaskExecutor applicationTaskExecutor() {
        return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
    }
}
